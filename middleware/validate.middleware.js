import { ApiError } from "../utils/ApiError";

const validate = ( schema ) => (req, res, next ) => {

    const result = schema.safeParse(req.body);

    if(!result.success) {

        const errorMessages = result.error.issues.map((issue) => issue.message);

        return next(
            new ApiError(400, "Validation Failed", errorMessages)
        );
    }

    req.body = result.data;

    next();
}



export { validate }