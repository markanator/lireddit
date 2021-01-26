"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (options) => {
    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "Invalid Email!",
            },
        ];
    }
    if (options.username.length <= 2) {
        return [
            {
                field: "username",
                message: "Too short!",
            },
        ];
    }
    if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: 'Cannot include "@"!',
            },
        ];
    }
    if (options.password.length <= 6) {
        return [
            {
                field: "password",
                message: "Too short!",
            },
        ];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map