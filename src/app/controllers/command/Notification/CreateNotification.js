const Notification = require('../../../model/Notification');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');

class CreateNotification {
        Validate(req) {
                const { description, role, url, type, title } = req.body;

                let errors = {};

                const descriptionError =
                        Validator.notEmpty(description, 'Mô tả') ||
                        Validator.notNull(description, 'Mô tả') ||
                        Validator.maxLength(description, 500, 'Mô tả');
                if (descriptionError) errors.description = descriptionError;

                const roleError = Validator.notEmpty(role, 'Vai trò') ||
                        Validator.isEnum(role, ['system_admin', 'device_manager', 'gift_manager'], 'Vai trò');
                if (roleError) errors.role = roleError;

                const urlError = Validator.maxLength(url, 500, 'URL');
                if (urlError) errors.url = urlError;

                const typeError = Validator.isEnum(type, ['info', 'warning', 'success'], 'Loại thông báo');
                if (typeError) errors.type = typeError;

                const titleError =
                        Validator.notEmpty(title, 'Tiêu đề') ||
                        Validator.notNull(title, 'Tiêu đề') ||
                        Validator.maxLength(title, 100, 'Tiêu đề');
                if (titleError) errors.title = titleError;

                return errors;
        }

        Handle = async (req, res) => {
                const errors = this.Validate(req);
                if (Object.keys(errors).length > 0) {
                return res.status(400).json({ success: false, errors });
                }

                const { description, role, url, type, title } = req.body;
                try {
                        const notification = new Notification({
                                description,
                                role,
                                url,
                                type,
                                title
                        });

                        await notification.save();

                        return res.status(201).json({
                                success: true,
                                message: messages.notification.Created,
                                data: notification
                        });
                } catch (error) {
                        console.error(error);
                        return res.status(500).json({
                                success: false,
                                message: messages.notification.CreateError
                        });
                }
        }
}

module.exports = new CreateNotification();