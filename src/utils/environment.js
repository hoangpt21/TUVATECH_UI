let apiRoot = '';
let ckeditorLicenseKey = '';
if(import.meta.env.DEV) {
    apiRoot = import.meta.env.VITE_API_ROOT_DEV;
    ckeditorLicenseKey = import.meta.env.VITE_CKEDITOR_LICENSE_KEY_DEV;
}
if(import.meta.env.PROD) {
    ckeditorLicenseKey = import.meta.env.VITE_CKEDITOR_LICENSE_KEY_PROD;
    if(import.meta.env.VITE_API_ROOT_PROD_ON_RENDER) {
        apiRoot = import.meta.env.VITE_API_ROOT_PROD_ON_RENDER
    } else if(import.meta.env.VITE_API_ROOT_PROD_ON_RAILWAY) {
        apiRoot = import.meta.env.VITE_API_ROOT_PROD_ON_RAILWAY
    } else  if(import.meta.env.VITE_API_ROOT_PROD_ON_DOCKER) {
        apiRoot = import.meta.env.VITE_API_ROOT_DEV_ON_DOCKER
    }
}


export const API_ROOT = apiRoot ;
export const CKEDITOR_LICENSE_KEY = import.meta.env.VITE_CKEDITOR_LICENSE_KEY_TRIAL;

