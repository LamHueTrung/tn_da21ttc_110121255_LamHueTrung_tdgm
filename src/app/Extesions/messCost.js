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
    getByIdUser: {
        getByIdUserNotfound: 'Không tìm thấy tài khoản.',
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

    importRooms: 
    {
        noFile: "Không có file nào được tải lên.",
        invalidRow: "Dữ liệu không hợp lệ.",
        success: "Danh sách phòng đã được import thành công.",
        error: "Lỗi khi import danh sách phòng.",
        emptyFile: "File không chứa dữ liệu.",
    },

    location: { 
        defaultDescription: "Mô tả mặc định của tòa nhà."
    },

    room: {
        updateSuccess: "Thông tin phòng đã được cập nhật thành công.",
        updateError: "Lỗi khi cập nhật phòng học.",
        toRoomNotFound: "Không tìm thấy phòng đích.",
        importDescription: "Phòng học mới được thêm từ file CSV.",
        getAllSuccess: "Lấy danh sách phòng học thành công.",
        getAllError: "Lỗi khi lấy danh sách phòng học.",
        getByIdSuccess: "Lấy thông tin chi tiết phòng học thành công.",
        getByIdError: "Lỗi khi lấy thông tin chi tiết phòng học.",
        roomNotFound: "Không tìm thấy phòng học.",
        getDevicesSuccess: "Lấy danh sách thiết bị trong phòng thành công.",
        getDevicesError: "Lỗi khi lấy danh sách thiết bị trong phòng.",
        deleteSuccess: "Phòng đã được xóa thành công và thiết bị được chuyển về kho chính.",
        deleteError: "Lỗi khi xóa phòng học."
    },
    assignDevice: {
        invalidRequest: "Yêu cầu không hợp lệ.",
        notEnoughDevices: "Không đủ thiết bị để thêm vào phòng học.",
        noDeviceProvided: 'Không có thiết bị nào được cung cấp.',
        invalidDevices: 'Danh sách thiết bị không hợp lệ.',
        success: 'Thiết bị đã được thêm vào phòng học.',
        error: 'Lỗi khi thêm thiết bị vào phòng học.'
    },

    device: {
        deviceNotFoundInRoom: "Không tìm thấy thiết bị trong phòng.",
        removeSuccess: "Thiết bị đã được xóa khỏi phòng và chuyển về kho chính.",
        removeError: "Lỗi khi xóa thiết bị khỏi phòng.",
        deviceNotFound: "Không tìm thấy thiết bị.",
        alreadyInRoom: "Thiết bị đã có trong phòng đích.",
        cannotMove: "Không thể di chuyển thiết bị khi đang hỏng hoặc bảo trì.",
        moveSuccess: "Thiết bị đã được di chuyển thành công.",
        moveError: "Lỗi khi di chuyển thiết bị.",
        getAvailableSuccess: "Lấy danh sách thiết bị có thể mượn thành công.",
        getAvailableError: "Lỗi khi lấy danh sách thiết bị có thể mượn."
    },

    teacher: {
        noFile: "Vui lòng tải lên file CSV.",
        emptyFile: "File CSV không chứa dữ liệu.",
        teacherNotFound: "Không tìm thấy giảng viên.",
        createSuccess: "Giảng viên đã được thêm thành công.",
        createError: "Lỗi khi thêm giảng viên.",
        duplicateEmail: "Email giảng viên đã tồn tại.",
        importSuccess: "Danh sách giảng viên đã được import thành công.",
        importError: "Lỗi khi import danh sách giảng viên.",
        updateSuccess: "Thông tin giảng viên đã được cập nhật thành công.",
        updateError: "Lỗi khi cập nhật giảng viên.",
        deleteSuccess: "Giảng viên đã được xóa thành công.",
        deleteError: "Lỗi khi xóa giảng viên.",
        cannotDeleteWithBorrowRequests: "Không thể xóa giảng viên do đang có đơn mượn thiết bị.",
        getAllSuccess: "Lấy danh sách giảng viên thành công.",
        getAllError: "Lỗi khi lấy danh sách giảng viên.",
        getByIdSuccess: "Lấy thông tin giảng viên thành công.",
        getByIdError: "Lỗi khi lấy thông tin giảng viên.",
        teacherNameExists: "Tên giảng viên đã tồn tại.",
        teacherEmailExists: "Email giảng viên đã tồn tại.",
    },
    
    borrowRequest: {
        createSuccess: "Đơn mượn thiết bị đã được tạo thành công.",
        createError: "Lỗi khi tạo đơn mượn thiết bị.",
        teacherNotFound: "Không tìm thấy giảng viên.",
        roomNotFound: "Không tìm thấy phòng học.",
        deviceNotFound: "Không tìm thấy thiết bị.",
        notEnoughDevices: "Không đủ số lượng thiết bị để mượn.",
        noDevicesProvided: "Danh sách thiết bị không hợp lệ.",
        invalidDevice: "Thiết bị hoặc số lượng không hợp lệ.",
        returnSuccess: "Thiết bị đã được trả thành công.",
        returnError: "Lỗi khi trả thiết bị.",
        borrowNotFound: "Không tìm thấy đơn mượn thiết bị.",
        invalidDeviceReturn: "Thiết bị không hợp lệ để trả.",
        alreadyReturned: "Tất cả thiết bị trong đơn này đã được trả.",
        
    },

    createGift: {
        giftExist: 'Quà tặng đã tồn tại.',
        giftCreateSuccess: 'Quà tặng đã được tạo.',
        createError: 'Lỗi khi kiểm tra hoặc tạo quà tặng.',
        locationNotFound: 'Kho quà tặng không tồn tại.',
    },

    gift: {
        giftNotFound: 'Quà tặng không tồn tại.',
        giftUpdateSuccess: 'Quà tặng đã được cập nhật.',
        giftUpdateError: 'Lỗi khi cập nhật quà tặng.',
        giftDeleteSuccess: 'Quà tặng đã được xóa.',
        giftDeleteError: 'Lỗi khi xóa quà tặng.',
        getAllSuccess: 'Lấy danh sách quà tặng thành công.',
        getAllError: 'Lỗi khi lấy danh sách quà tặng.',
        getByIdSuccess: 'Lấy thông tin quà tặng thành công.',
        getByIdError: 'Lỗi khi lấy thông tin quà tặng.',
        invalidGift: 'Quà tặng không hợp lệ.',
        noFile: 'Không có file nào được tải lên.',
        emptyFile: 'File không chứa dữ liệu.',
        importSuccess: 'Danh sách quà tặng đã được import thành công.',
        importError: 'Lỗi khi import danh sách quà tặng.',
        notFound: 'Không tìm thấy quà tặng.',   
        updateSuccess: 'Quà tặng đã được cập nhật.',   
        updateError: 'Lỗi khi cập nhật quà tặng.',
    },
    
    getGift: {
        getAllSuccess: 'Lấy danh sách quà tặng thành công.',
        getAllError: 'Lỗi khi lấy danh sách quà tặng.',
        giftNotFound: 'Không tìm thấy quà tặng.',
        getByIdSuccess: 'Lấy thông tin chi tiết quà tặng thành công.',
        getByIdError: 'Lỗi khi lấy thông tin chi tiết quà tặng.',
    },

    importRewards: {
        noFile: 'Không có file nào được tải lên.',
        emptyFile: 'File không chứa dữ liệu.',
        success: 'Danh sách quà tặng đã được import thành công.',
        error: 'Lỗi khi import danh sách quà tặng.',
    }
};

module.exports = messages;
