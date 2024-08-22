import validator from "validator";

// creating first time
export const validateUserInput = (data) => {
    let errors = {};

    const blacklistChars = "'\";\\/=`";

    // Helper function to check for blacklisted characters
    const containsBlacklistedChars = (str) => {
        const pattern = new RegExp(`[${blacklistChars}]`);
        return pattern.test(str);
    };

    // Validate username
    if (!data.business_name) {
        errors.business_name = "Name is required";
    } else if (containsBlacklistedChars(data.business_name)) {
        errors.business_name = `Name contains invalid characters: ${blacklistChars}`;
    } else if (!validator.isLength(data.business_name, { min: 2, max: 100 })) {
        errors.business_name = "Name must be between 2 and 100 characters";
    }
    // else if (!validator.isAlphanumeric(data.name)) {
    //     errors.name = "Name must contain only letters and numbers";
    // }

    // Validate email
    if (!data.email) {
        errors.email = "Email is required";
    } else if (containsBlacklistedChars(data.email)) {
        errors.email = `Email contains invalid characters: ${blacklistChars}`;
    } else if (!validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }

    // Validate password
    if (!data.password) {
        errors.password = "Password is required";
    } else if (containsBlacklistedChars(data.password)) {
        errors.password = `Password contains invalid characters: ${blacklistChars}`;
    } else if (!validator.isLength(data.password, { min: 8, max: 30 })) {
        errors.password = "Password must be at least 8 characters";
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
};
// when updating data
export const validateUserInputData = (data) => {
    let errors = {};

    const blacklistChars = "'\";\\/=`";

    // Helper function to check for blacklisted characters
    const containsBlacklistedChars = (str) => {
        const pattern = new RegExp(`[${blacklistChars}]`);
        return pattern.test(str);
    };

    // Validate username
    if (data.business_name) {
        if (containsBlacklistedChars(data.business_name)) {
            errors.business_name = `Name contains invalid characters: ${blacklistChars}`;
        } else if (!validator.isLength(data.name, { min: 2, max: 100 })) {
            errors.business_name = "Name must be between 2 and 100 characters";
        }
    }

    if (data.description) {
        if (containsBlacklistedChars(data.description)) {
            errors.description = `Description contains invalid characters: ${blacklistChars}`;
        }
    }

    // Validate email
    if (data.email) {
        if (containsBlacklistedChars(data.email)) {
            errors.email = `Email contains invalid characters: ${blacklistChars}`;
        } else if (!validator.isEmail(data.email)) {
            errors.email = "Email is invalid";
        }
    }

    if (data.password) {
        if (containsBlacklistedChars(data.password)) {
            errors.password = `Password contains invalid characters: ${blacklistChars}`;
        } else if (!validator.isLength(data.password, { min: 8, max: 30 })) {
            errors.password = "Password must be at least 8 characters";
        }
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
};

// check for the presence of sql symbols
export const validateInputs = (input) => {
    const blacklistChars = "'\";\\/=`";

    // Helper function to check for blacklisted characters
    const containsBlacklistedChars = (str) => {
        const pattern = new RegExp(`[${blacklistChars}]`);
        return pattern.test(str);
    };

    // Validate data
    if (containsBlacklistedChars(input)) {
        const error = `input contains invalid characters: ${blacklistChars}`;
        return [error, false];
    }
    return [null, true];
};

export const validateAllInputs = (data) => {
    let errors = {};
    let isValid = true;
    for (let key in data) {
        const [error, isValidInput] = validateInputs(data[key]);
        if (!isValidInput) {
            isValid = false;
            errors[key] = error;
        }
    }
    return [errors, isValid];
};
