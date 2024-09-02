// in form of promise
const asyncHandler = (requstHandler) => {
   return (req, res, next) =>{
        Promise.resolve(requstHandler(req,res,next)).
        catch((err) => {
            next(err);
        })
    }
}

export {asyncHandler}

// in form of try catch 

/*
const asyncHandler = (fn) => async (req, res, next) => { // ye ek Higer Order Function hai jo ki functions ko as aparameter bhi accept kar te hai y fir as avariable return kartai hai
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })

    }
} 

*/