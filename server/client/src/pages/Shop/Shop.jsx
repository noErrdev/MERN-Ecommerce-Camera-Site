import React, { useEffect } from "react";

import { FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  SectionTitle,
  ProductRating,
  Footer,
  Loading,
  Loader,
} from "../../components";

import { getAllProduct } from "../../redux/actions/productActions";
const Shop = () => {
  const dispatch = useDispatch();
  const productsData = useSelector((state) => state.allProducts);

  const { products, loading, error } = productsData;

  useEffect(() => {
    dispatch(getAllProduct());
  }, [dispatch]);
  return (
    <>
      <section className="products container-div shop">
        <SectionTitle title="Products" />

        <div className="products__container grid">
          {loading ? (
            <Loader backdrop />
          ) : error ? (
            <h2
              style={{ color: "#333", fontWeight: "500", textAlign: "center" }}
            >
              {error}
            </h2>
          ) : (
            <>
              {products?.map((product) => (
                <div key={product?._id} className="products__container__item">
                  <Link to="/">
                    <img src={product?.images?.url} alt="" />
                  </Link>
                  <div>
                    <h3>{product.name}</h3>
                    <h5>${product.price}</h5>
                    <ProductRating ratingValue={product.ratings} />
                    <div>
                      <button className="button">
                        <FiShoppingCart /> Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        {products?.length === 0 && (
          <h3 style={{ color: "#333", fontWeight: "500", textAlign: "center" }}>
            No product found.
          </h3>
        )}
      </section>
      <Footer />
    </>
  );
};

export default Shop;
