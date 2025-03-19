/**
 * Table Use-cases
 */


describe('[Tables]', async () => {

    describe('@POST /tables', () => {
        it(' => Creating Table ... ', (done) => {
            chai.request(express_application)
                .post('/tables')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    facility: __facility__id,
                    name: 'Corner Table',
                    number: '11A',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __table__id = res.body.item._id
                    done()
                })
        })
    })

    describe('@PUT /tables/{id}', () => {
        it(' => Updating Table ... ', (done) => {
            chai.request(express_application)
                .put('/tables/' + __table__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    facility: __facility__id,
                    name: 'Corner Table',
                    number: '11A',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /tables', () => {
        it(' => Listing Table ... ', (done) => {
            chai.request(express_application)
                .get('/tables')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /tables/{id}', () => {
        it(' => Get Single Table ... ', (done) => {
            chai.request(express_application)
                .get('/tables/' + __table__id)
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