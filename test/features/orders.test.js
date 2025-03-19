/**
 * Orders Use-cases
 */

describe('[Orders]', async () => {

    describe('@POST /orders', () => {
        it(' => Creating Order (Dine In) ... ', (done) => {
            chai.request(express_application)
                .post('/orders')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    facility: __facility__id,
                    customer: __customer__id,
                    tab: null,
                    table: __table__id,
                    type: "table",
                    items: JSON.stringify([{ product: __product__id, quantity: 1, amount: 10, note: 'test', selected_variations: [{ name: 'Pieces', selection: 'single', options: [], option: '6' }] }]),
                    status: "new",
                    total: "10"
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __order_id = res.body.item._id
                    done()
                })
        })
    })

    describe('@POST /orders', () => {
        it(' => Creating Order (Takeaway) ... ', (done) => {
            chai.request(express_application)
                .post('/orders')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    facility: __facility__id,
                    customer: __customer__id,
                    tab: null,
                    table: __table__id,
                    type: "takeaway",
                    items: JSON.stringify([{ product: __product__id, quantity: 1, amount: 10, note: 'test', selected_variations: [{ name: 'Pieces', selection: 'single', options: [], option: '6' }] }]),
                    status: "new",
                    total: "10"
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __order_id2 = res.body.item._id
                    done()
                })
        })
    })

    describe('@PUT /orders/{id}/updateStatus', () => {
        it(' => Updating Order Status ... ', (done) => {
            chai.request(express_application)
                .put('/orders/' + __order_id + '/updateStatus')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    status: 'preparing'
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /orders', () => {
        it(' => Listing Orders ... ', (done) => {
            chai.request(express_application)
                .get('/orders')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /orders/{id}', () => {
        it(' => Get Single Order ... ', (done) => {
            chai.request(express_application)
                .get('/orders/' + __order_id)
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