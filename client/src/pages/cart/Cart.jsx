import { useEffect, useState, useRef, useMemo } from "react";
import NavBar from "../../components/NavBar";
import { CartProduct } from "./CartProduct";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { useCartContext } from "../../contexts/cartContext";
import { DisplayModal } from "../../components/DisplayModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useUserContext } from "../../contexts/userContext";
import { useProductContext } from "../../contexts/productContext";
import { useCheckoutContext } from "../../contexts/checkoutContext";

const Cart = () => {
  const navigate = useNavigate();
  const { user, token } = useUserContext();
  const { cart, setCart } = useCartContext();
  const { products } = useProductContext();
  const { setTotalBill } = useCheckoutContext();
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  let deleteID = useRef();

  let total = useMemo(() => {
    if (cart) {
      return cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    }
  }, [cart]);

  useEffect(() => {
    setTotalBill(total);
  }, [total]);

  const handleClick = () => {
    setConfirmModal(false);
    deleteItem(deleteID.current);
  };

  const deleteItem = async (itemID) => {
    try {
      const URL = import.meta.env.VITE_URL;
      const response = await fetch(`${URL}/cart/deleteItem/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          itemID: itemID,
        }),
      });
      const data = await response.json();
      if (response.status === 200) {
        setShowModal(true);
        setCart(cart.filter((item) => item._id !== itemID));
      } else if (response.status === 500) {
        alert(data.error);
      }
    } catch (err) {
      // console.log(err);
    }
  };

  useEffect(() => {
    if (token && user && products) {
      // console.log(token, user);
      fetchCart();
    }
  }, [token, user, products]);

  const getCartData = (data) => {
    const items = data.items.map((item) => {
      const productData = products.find(
        (product) => product._id === item.productID
      );
      console.log("Product Data", productData);
      let newItem = {
        _id: item._id,
        category: productData.category,
        productID: item.productID,
        quantity: item.quantity,
        size: item.size,
        title: productData.title,
        price: productData.price,
        images: productData.images,
      };
      return newItem;
    });

    return items;
  };

  const fetchCart = async () => {
    try {
      const URL = import.meta.env.VITE_URL;
      const response = await fetch(`${URL}/cart/getCart/${user._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      const data = await response.json();
      console.log("Cart data from backend", data);
      if (data.message) {
        return;
      }
      const cartData = getCartData(data);
      setCart(cartData);
    } catch (error) {
      // console.log(error);
    }
  };
  console.log("Cart", cart);

  return (
    <>
      <NavBar />

      {/* heading */}
      <div className="header flex flex-col items-center my-2 md:items-start md:ml-7">
        <h1 className="pt-3 text-3xl font-semibold md:pb-1 xl:text-4xl">
          Your Cart
        </h1>
        <h3 className="text-md pt-1 xl:text-lg">
          Not ready to checkout?
          <Link
            to={"/shop/shirts"}
            className="pl-1.5 font-semibold text-PrimaryBlue cursor-pointer"
          >
            Continue Shopping
          </Link>
        </h3>
      </div>

      {/* product cards */}
      <div className="cart_section flex flex-col px-1 lg:flex-row xl:w-full">
        {cart && cart.length > 0 ? (
          <div className="cart_products my-5 flex flex-col md:h-[80vh] md:overflow-y-auto gap-4 xl:w-1/2 xl:mr-16 xl:ml-3">
            {cart.map((item) => {
              return (
                <CartProduct
                  item={item}
                  cart={cart}
                  key={item._id}
                  setCart={setCart}
                  setConfirmModal={setConfirmModal}
                  deleteID={deleteID}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-black my-5 flex flex-col gap-4 xl:w-1/2 xl:mr-16 ml-8">
            <h1 className="text-xl">
              Your Cart is Empty :) <br />
              Explore our collection and add items to your cart
            </h1>
          </div>
        )}
        {/* Modal to display message */}
        {showModal && (
          <DisplayModal showModal={showModal} setShowModal={setShowModal}>
            Item successfully Deleted
          </DisplayModal>
        )}

        {confirmModal && (
          <ConfirmModal
            confirmModal={confirmModal}
            setConfirmModal={setConfirmModal}
            confirmText={"Delete"}
            handleClick={handleClick}
          >
            Are you sure you want to Remove the item from Cart
          </ConfirmModal>
        )}

        {/* order_details */}
        <div className="order_details flex flex-col h-fit my-7 mx-5 bg-lightestBlue rounded-lg shadow-lg py-10 px-5 md:mx-14 md:px-10 lg:mx-5 lg:grow lg:py-20 lg:px-5 xl:w-1/2 xl:mr-10 xl:px-8 xl:gap-4 xl:py-12">
          <h1 className="text-2xl font-semibold lg:my-2 xl:text-3xl">
            Order Summary
          </h1>
          <input
            type="text"
            placeholder="Enter coupon code here"
            className="bg-transparent outline-none px-3 py-3 border border-black rounded-sm placeholder:text-lg my-4 text-lg md:mx-1"
          />
          {cart && (
            <ul className="product_list flex flex-col gap-1 pb-4 border-b border-gray-400">
              {cart.map((item) => {
                return (
                  <li className="flex justify-between" key={item._id}>
                    <div className="flex justify-center ml-2  text-lg font-Poppins items-center">
                      <span className="product_name">{item.title}</span>
                      <span className="ml-2">x {item.quantity}</span>
                    </div>
                    <span className="price mr-4 text-lg font-semibold text-PrimaryBlue font-Poppins">
                      ${item.price}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="total flex justify-between my-2">
            <span className="font-bold text-xl ml-3 xl:text-2xl">Total</span>
            <span className="total_price mr-4 text-xl font-semibold font-Poppins xl:teext-2xl">
              ${total ? total : 0}
            </span>
          </div>
          <button
            className="mt-3 px-5 py-3 border border-PrimaryBlue bg-PrimaryBlue text-xl text-white font-semibold md:mx-1"
            onClick={() => {
              if(cart.length > 0) {
                navigate("/cart/checkout")
              }
            }}
          >
            Continue to Checkout
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
