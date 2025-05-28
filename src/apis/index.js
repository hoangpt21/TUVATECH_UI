import { message } from "antd";
import authorizeAxiosInstance from "../utils/authorizeAxios";

export const verifyUserAPI = async (data) => {
    const reponse = await authorizeAxiosInstance.put(`/v1/users/verify`, data);
    message.success('Xác minh tài khoản thành công!')
    return reponse.data;
}

export const registerUserAPI = async (data) => {
    const reponse = await authorizeAxiosInstance.post(`/v1/users/register`, data);
    message.success('Tạo tài khoản thành công!')
    return reponse.data;
}

export const refreshTokenAPI = async () => {
    const response = await authorizeAxiosInstance.get(`/v1/users/refresh_token`);
    return response.data;
}

export const uploadFileAPI = async (file, folderName) => {
    let reqData = new FormData();
    reqData.append('avatar', file);
    const response = await authorizeAxiosInstance.put(`/v1/cloudinary/upload/${folderName}`, reqData);
    return response.data;
}

export const getProvincesAPI = async () => {
    const response = await authorizeAxiosInstance.get(`/v1/addresses/provinces`);
    return response.data;
}

export const getDistrictsAPI = async (provinceCode) => {
    const response = await authorizeAxiosInstance.get(`/v1/addresses/districts?code=${provinceCode}`);
    return response.data;
}

export const getWardsAPI = async (districtCode) => {
    const response = await authorizeAxiosInstance.get(`/v1/addresses/wards?code=${districtCode}`);
    return response.data;
}

export const filterProductsAPI = async ({ 
    searchKeyword = '',
    sortBy = '',
    minPrice = null,
    maxPrice = null,
    categoryId = null,
    brandId = null,
    select = '*',
    limit = 50,
    offset = 0
  }) => {
    const params = {
      sKw: searchKeyword,
      srt: sortBy,
      minP: minPrice,
      maxP: maxPrice,
      ctgId: categoryId,
      brId: brandId,
      select,
      limit,
      offset
    };
    const response = await authorizeAxiosInstance.get(`/v1/products/active/filter`, {
        params
    });
    return {products: response.data?.products, total: response.data?.total};
}

export const bestSellersAPI = async ({limit, offset}) => {
    const response = await authorizeAxiosInstance.get(`/v1/products/active/best_seller`, {
        params: {
            limit,
            offset
        }
    });
    return response.data;
}

export const getPayMentMethodAPI = async (amount, orderId, paymentType) => {
    const response = await authorizeAxiosInstance.post(`/v1/payments/${paymentType}/create-qrcode`, {
        amount,
        orderId
    });
    return response.data;
}

export const sendOTPByEmailAPI = async (email) => {
    const response = await authorizeAxiosInstance.post(`/v1/users/send-otp-by-email`, {
        email
    });
    return response.data;
}

export const verifyOTPByEmailAPI = async (email, otp) => {
    const response = await authorizeAxiosInstance.post(`/v1/users/verify-otp-by-email`, {
        email,
        otp
    });
    return response.data;
}

export const resetPasswordByEmail = async (email, password) => {
    const response = await authorizeAxiosInstance.put(`/v1/users/reset-password-by-email`, {
        email,
        password
    });
    return response.data;
}

export const getRecommendationAPI = async (userId) => {
    let newUserId = userId;
    if(!userId) {
        newUserId = 'popular';
    }
    const response = await authorizeAxiosInstance.get(`/v1/products/recommendation/${newUserId}`);
    return response.data;
}
