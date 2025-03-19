/**
 * Tab Use-cases
 */


describe('[Tabs]', async () => {

    describe('@POST /tabs', () => {
        it(' => Creating Tab ... ', (done) => {
            chai.request(express_application)
                .post('/tabs')
                .set('Authorization', 'Bearer ' + __customer_token)
                .send({
                    facility: __facility__id,
                    customer: __customer__id,
                    table: __table__id,
                    stripe_customer: __customer__stripe_customer_id,
                    stripe_payment_method: __customer__stripe_payment_method_id,
                    limit: 100,
                    pin: "123",
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __tab__id = res.body.item._id
                    done()
                })
        })
    })

    describe('@PUT /tabs/{id}/verify-pin', () => {
        it(' => Verifying Tab Pin ... ', (done) => {
            chai.request(express_application)
                .put('/tabs/' + __tab__id + '/verify-pin')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    pin: '123',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status')
                    done()
                })
        })
    })

    describe('@PUT /tabs/{id}/set-limit', () => {
        it(' => Changing Tab Limit ... ', (done) => {
            chai.request(express_application)
                .put('/tabs/' + __tab__id + '/set-limit')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    customer: __customer__id,
                    new_limit: 150,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    done()
                })
        })
    })

    describe('@GET /tabs', () => {
        it(' => Listing Tabs ... ', (done) => {
            chai.request(express_application)
                .get('/tabs')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /tabs/{id}', () => {
        it(' => Get Single Tab ... ', (done) => {
            chai.request(express_application)
                .get('/tabs/' + __tab__id)
                .set('Authorization', 'Bearer ' + __customer_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    done()
                })
        })
    })

})