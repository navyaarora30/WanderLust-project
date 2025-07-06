const Joi = require('joi');
const review = require('./models/review');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().optional().allow(null, '')
        }).optional().allow(null)
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5).messages({
            'any.required': '"Rating" is required'
        }),
        comment: Joi.string().required().messages({
            'string.empty': '"Comment" is required',
            'any.required': '"Comment" is required',
        }),        
    }).required().messages({
        'any.required': '"Review" is required'
    })
}).required();