const messages = {
    // Message validator
    validation: {
        notEmpty: (fieldName) => `${fieldName} không được để trống.`,
        notNull: (fieldName) => `${fieldName} không được là null.`,
        greaterThan: (fieldName, minValue) => `${fieldName} phải lớn hơn ${minValue}.`,
        maxLength: (fieldName, maxLength) => `${fieldName} không được dài hơn ${maxLength} ký tự.`,
        invalidEmail: 'Email không hợp lệ.',
        invalidPhoneNumber: 'Số điện thoại không hợp lệ.',
        invalidDate: (fieldName) => `${fieldName} không hợp lệ.`,
        maxFileSize: (fieldName, maxSizeMB) => `${fieldName} không được vượt quá ${maxSizeMB}MB.`,
        invalidEnum: (fieldName) => `${fieldName} không hợp lệ.`,
        invalidFileType: (fieldName, allowedTypes) => `${fieldName} chỉ chấp nhận các định dạng: ${allowedTypes}.`,
        requiredField: (fieldName) => `${fieldName} không tồn tại.`,
        arrayNotEmpty: (fieldName) => `${fieldName} không được để trống`,
        isPositiveNumber: (fieldName) => `${fieldName} phải là một số dương`,
        containsVietnamese: 'Chuỗi không được chứa ký tự tiếng Việt.',
        invalidUrl: (fieldName) => `${fieldName} không phải là một URL nhúng YouTube hợp lệ.`,
        invalidDurationFormat: (fieldName) => `${fieldName} phải có định dạng hh:mm:ss.`,
        invalidDurationValue: (fieldName) => `${fieldName} phải lớn hơn 0.`,
        equals: (fieldName) => `${fieldName} không khớp với nhau.`,
        invalidType: (fieldName, type) => `${fieldName} phải là kiểu ${type}.`,
    },

    // Message Token 
    token: {
        tokenVerificationFailed: 'Token verification failed.',
        tokenVerificationSucces: 'Token verification success.',
        tokenNotFound: 'Token not found.',
        tokenFetchingError: 'Error fetching data.'
    },

    //Message session
    session: {
        sessionDestroyFailed: 'Failed to destroy session during logout.',
        sessionDestroySucces: 'Logged out successfully.',
    },
    
    // Message login
    login: {    
        usernameRequired: 'Tên đăng nhập là bắt buộc.',
        passwordRequired: 'Mật khẩu là bắt buộc.',
        invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không đúng.',
        usernameNotFound: 'Tài khoản không tồn tại',
        usernamesoftDelete: 'Tài khoản đã bị vô hiệu hoá',
        passwordCompaseFailed: 'Mật khẩu không chính xác',
        usernameNotRole: 'Tài khoản không có quyền truy cập',
        usernameAdminRole: 'Tài khoản này là tài khoản admin',
        loginError: 'Lỗi khi xử lý đăng nhập.'
    },

    // Message User
    createUser: {
        accountAdminExist: 'Tài khoản admin đã tồn tại.',
        accountCreateSuccess:'Tài khoản admin đã được tạo.',
        accountCreateError: 'Lỗi khi kiểm tra hoặc tạo tài khoản admin.',
        avartarRequried: 'Ảnh đại diện là bắt buộc.',
        accountExist: 'Tài khoản đã tồn tại.',
        RegisterErorr: 'Lỗi khi xử lý đăng ký.',
    },

    deleteUser: {
        softDeleteError: 'Không thể xóa người dùng.',
        softDeleteSucces: 'Người dùng đã được vô hiệu hóa!',
    },

    updateUser: {
        changePasswordDecrypt:'Mật khẩu không chính xác.',
        changePasswordError: 'Lỗi khi xử lý thay đổi mật khẩu.',
        userNotFound: "Người dùng không tồn tại.",
        updateError: "Lỗi khi cập nhật người dùng.",
        updateSuccess: "Người dùng đã được cập nhật thành công.",
        notFound: 'tài khoản không tồn tại'
    },

    getAllUser: {
        getAllUserError: 'Lỗi khi lấy danh sách tài khoản.',
    },

    restoreUser: {
        restoreError: "Lỗi khi khôi phục người dùng.",
        restoreSuccess: "Người dùng đã được khôi phục thành công."
    },

    deleteUser: {
        softDeleteError: "Không thể vô hiệu hóa người dùng.",
        softDeleteSuccess: "Đã vô hiệu hóa người dùng thành công.",
        deleteError: "Không thể xóa người dùng.",
        deleteSuccess: "Đã xóa người dùng thành công."
    },

    // Message Device
    createDevice: {
        deviceExist: "Thiết bị đã tồn tại.",
        deviceCreateSuccess: "Thiết bị đã được tạo.",
        createError: "Lỗi khi kiểm tra hoặc tạo thiết bị."
    },

    updateDevice: { 
        deviceUpdateSuccess: "Thiết bị đã được cập nhật.",
        updateError: "Lỗi khi cập nhật thiết bị.",
        deviceNotFound: "Thiết bị không tồn tại"
    },

    deleteDevice: {
        deviceNotFound: "Thiết bị không tồn tại.",
        deviceDeleteSuccess: "Thiết bị đã được xóa.",
        deleteError: "Lỗi khi xóa thiết bị."
    },

    getDevice: {
        getAllSuccess: "Danh sách thiết bị đã được lấy.",
        getAllError: "Lỗi khi lấy danh sách thiết bị.",
    },

};

module.exports = messages;
