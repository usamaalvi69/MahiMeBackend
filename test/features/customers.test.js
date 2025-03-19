/**
 * Customer Use-cases
 */
let __customer_sms_code = ''

describe('[Customers]', async () => {

    describe('@POST /customers', () => {
        it(' => Creating Customer ... ', (done) => {
            chai.request(express_application)
                .post('/customers')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    facility: __facility__id,
                    first_name: "Karla",
                    last_name: "Thompson",
                    email: "karla.thompson@test.com",
                    phone: "+923251425685",
                    password: "123456"
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('customer')
                    __customer__id = res.body.customer._id
                    __customer_sms_code = res.body.customer.sms_code
                    __customer_token = res.body.token
                    done()
                })
        })
    })

    describe('@GET /customers/{code}/verify/sms', () => {
        it(' => Sms code verification ... ', (done) => {
            chai.request(express_application)
                .get('/customers/' + __customer_sms_code + '/verify/sms')
                .set('Authorization', 'Bearer ' + __customer_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('customer')
                    done()
                })
        })
    })
    
    /*
    describe('@PUT /customers/{_id}/add-stripe-payment-method', () => {
        it(' => Adding card to stripe to get payment method ... ', (done) => {
            chai.request(express_application)
                .put('/customers/' + __customer__id + '/add-stripe-payment-method')
                .set('Authorization', 'Bearer ' + __customer_token)
                .send({
                    card_number: 4000000000000077,
                    exp_month: 6,
                    exp_year: 2029,
                    cvc: 123,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('stripe_payment_method')
                    __customer__stripe_payment_method_id = res.body.stripe_payment_method.id
                    done()
                })
        })
    })

    describe('@PUT /customers/{_id}/add-stripe-customer', () => {
        it(' => creating stripe customer ... ', (done) => {
            chai.request(express_application)
                .put('/customers/' + __customer__id + '/add-stripe-customer')
                .set('Authorization', 'Bearer ' + __customer_token)
                .send({
                    stripe_payment_method: __customer__stripe_payment_method_id
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('stripe_customer')
                    __customer__stripe_customer_id = res.body.stripe_customer.id
                    done()
                })
        })
    })
    */

    describe('@PUT /customers/{id}', () => {
        it(' => Updating Customer ... ', (done) => {
            chai.request(express_application)
                .put('/customers/' + __customer__id)
                .set('Authorization', 'Bearer ' + __customer_token)
                .send({
                    first_name: "Karla",
                    last_name: "Thompson",
                    email: "karla.thompson@test.com",
                    phone: "+923251425685",
                    password: "123456"
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /customers', () => {
        it(' => Listing Customers ... ', (done) => {
            chai.request(express_application)
                .get('/customers')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /customers/{id}', () => {
        it(' => Get Single Customer ... ', (done) => {
            chai.request(express_application)
                .get('/customers/' + __customer__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    done()
                })
        })
    })

})