import { productReducer } from './productSlice'
import { productAttributeReducer } from './productAttributeSlice'
export {
  productReducer,
  productAttributeReducer,
}
// Product Actions
export {
  selectProducts, 
  selectProductDetail,
  selectTotalProducts,
  selectActiveProducts,
  setProductDetail,
  fetchFilteredActiveProducts,
  fetchTotalProducts,
  fetchAllProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from './productSlice';


// Product Attribute Actions
export {
  selectProductAttributes,
  fetchAllAttributes,
  fetchProductAttributesByProductId,
  createProductAttribute,
  updateProductAttribute,
  deleteProductAttribute,
  deleteProductAttributesByProductId,
} from './productAttributeSlice';
 