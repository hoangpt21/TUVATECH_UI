export const NAME_RULE_MESSAGE = 'Vui lòng nhập họ và tên';
export const EMAIL_RULE_CONFIRM = 'Email không hợp lệ';
export const EMAIL_RULE_MESSAGE = 'Vui lòng nhập email';
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/;
export const PASSWORD_RULE_MESSAGE = 'Mật khẩu phải bao gồm ít nhất 8 ký tự (1 chữ cái, 1 số)';
export const PASSWORD_RULE_CONFIRMATION = 'Mật khẩu xác nhận không khớp';
export const PHONE_RULE = /^[0-9]{10}$/;
export const PHONE_RULE_CONFIRM = 'Số điện thoại không hợp lệ';
export const PHONE_RULE_MESSAGE = 'Vui lòng nhập số điện thoại';
export const PROVINCE_RULE_MESSAGE = 'Vui lòng chọn tỉnh/thành phố';
export const DISTRICT_RULE_MESSAGE = 'Vui lòng chọn quận/huyện';
export const WARD_RULE_MESSAGE = 'Vui lòng chọn phường/xã';

// Liên quan đến Validate File
export const LIMIT_COMMON_FILE_SIZE = 10485760; // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = 'image/jpg, image/jpeg, image/png, image/webp';
