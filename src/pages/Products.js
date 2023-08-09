import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import '../styles/pages/Products.css';
import CatgoryLastpage from '../config/services/CatagoryLastpage';
import CategoryNavi from '../components/CategoryNavi';
// import RecommendationsContainter from '../components/RecommendationsContainter';
import Card from '../components/Card.js';
import coverpic from '../assets/cover/categoryCover/all.jpg';

export function mainContent(listofProducts, numPage, props) {
  if (!listofProducts) {
    return;
  }
  function renderProductCards(products, numPage) {
    function coverCardBox() {
      return (
        <div className="cardBox cover" key="cover">
          <div className="coverContainer">
            <img src={coverpic} alt="coverpicforproducts"></img>
          </div>
        </div>
      );
    }
    const productCards = products.map((product, index) => (
      <div className="cardBox" key={index}>
        <Card
          product={product}
          index={index}
          shareState={props.shareState}
          setShareState={props.setShareState}
        />
      </div>
    ));
    if (numPage === 1) {
      return [coverCardBox(), ...productCards];
    }
    return [...productCards];
  }

  return (
    <div className="mainContent productsPage">
      {renderProductCards(listofProducts, numPage)}
    </div>
  );
}

function pageNavi(numPage, lastNumPage, handlePageChange) {
  if (lastNumPage === 1) {
    return;
  }
  const handlePageOnClick = (newPage) => {
    if (newPage >= 1 && newPage <= lastNumPage) {
      handlePageChange(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    // Generate the page number links
    for (let page = 1; page <= lastNumPage; page++) {
      const isCurrentPage = page === numPage;
      const pageNumber = (
        <button
          key={page}
          className={isCurrentPage ? 'active' : ''}
          onClick={() => handlePageOnClick(page)}
        >
          {page}
        </button>
      );
      pageNumbers.push(pageNumber);
    }

    return pageNumbers;
  };

  return (
    <div className="pageNavi">
      <button
        className={numPage === 1 ? `isDisabled` : ``}
        onClick={() => handlePageOnClick(numPage - 1)}
      >
        <div className="triangle left"></div>
      </button>
      {renderPageNumbers()}
      <button
        className={numPage === lastNumPage ? `isDisabled` : ``}
        onClick={() => handlePageOnClick(numPage + 1)}
      >
        <div className="triangle right"></div>
      </button>
    </div>
  );
}

const fetchProductList = async (category, page) => {
  let apilink = `/api/product/getProductsList/${category ? category : 'all'}${
    page ? '/' + page : ''
  }`;

  try {
    const resProductList = await axios.get(apilink);
    return resProductList.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};

export default function Products(props) {
  const { routeParameter, routeParameter2 } = useParams();
  const [state, setState] = useState({
    numPage: 1,
    category: { category_id: '', lastPage: 1 },
    productList: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const newlocation = { numPage: 1, category: { category_id: '' } };
    if (routeParameter) {
      if (!routeParameter2) {
        if (parseInt(routeParameter)) {
          newlocation.numPage = parseInt(routeParameter);
          newlocation.category.category_id = '';
        } else {
          newlocation.category.category_id = routeParameter;
        }
      } else {
        newlocation.category.category_id = routeParameter;
        newlocation.numPage = parseInt(routeParameter2);
      }
    }

    async function fetchData(props) {
      try {
        if (props.category.category_id === '') {
          props.category.lastPage = await CatgoryLastpage.getCatgoryLastpage()[
            'all'
          ].lastPage;
        } else {
          props.category.lastPage = await CatgoryLastpage.getCatgoryLastpage()[
            props.category.category_id
          ].lastPage;
        }
        props.productList = await fetchProductList(
          props.category.category_id,
          props.numPage
        );
        setState(props);

        // Handle the fetched data or perform other actions
      } catch (error) {
        // Handle any errors that occurred during fetching

        console.error(error);
      }
    }

    fetchData(newlocation);
  }, [routeParameter, routeParameter2]);

  const handlePageChange = (newPage) => {
    if (state.category.category_id === '') {
      navigate(`/products/${newPage}`);
    } else {
      navigate(`/products/${state.category.category_id}/${newPage}`);
    }
  };

  return (
    <div className="ProductsPage">
      <CategoryNavi currentCategory={state.category.category_id} />
      {state.productList && state.category.lastPage ? (
        <>
          {/* {pageNavi(state.numPage, state.category.lastPage, handlePageChange)} */}
          {mainContent(state.productList, state.numPage, props)}
          {pageNavi(state.numPage, state.category.lastPage, handlePageChange)}
          {/* <RecommendationsContainter /> */}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
