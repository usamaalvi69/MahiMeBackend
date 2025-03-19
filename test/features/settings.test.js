/**
 * Setting Use-cases
 */


describe('[Settings]', async () => {

    describe('@POST /settings', () => {
        it(' => Creating Setting ... ', (done) => {
            chai.request(express_application)
                .post('/settings')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    name: "Eid Day",
                    holiday_date: new Date().toString(),
                    surcharge: "yes",
                    surcharge_percentage: 5,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __setting__id = res.body.item._id
                    done()
                })
        })
    })

    describe('@PUT /settings/{id}', () => {
        it(' => Updating Setting ... ', (done) => {
            chai.request(express_application)
                .put('/settings/' + __setting__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    name: "Eid Day",
                    holiday_date: new Date().toString(),
                    surcharge: "yes",
                    surcharge_percentage: 5,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /settings', () => {
        it(' => Listing Settings ... ', (done) => {
            chai.request(express_application)
                .get('/settings')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /settings/{id}', () => {
        it(' => Get Single Setting ... ', (done) => {
            chai.request(express_application)
                .get('/settings/' + __setting__id)
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