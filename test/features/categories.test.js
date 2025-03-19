/**
 * Category Use-cases
 */


describe('[Categories]', async () => {

    describe('@POST /categories', () => {
        it(' => Creating Category ... ', (done) => {
            chai.request(express_application)
                .post('/categories')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    facility: __facility__id,
                    name: 'Burgers',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __category__id = res.body.item._id
                    done()
                })
        })
    })

    describe('@PUT /categories/{id}', () => {
        it(' => Updating Category ... ', (done) => {
            chai.request(express_application)
                .put('/categories/' + __category__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    facility: __facility__id,
                    name: 'Burgers',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /categories', () => {
        it(' => Listing Categories ... ', (done) => {
            chai.request(express_application)
                .get('/categories')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /categories/{id}', () => {
        it(' => Get Single Category ... ', (done) => {
            chai.request(express_application)
                .get('/categories/' + __category__id)
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