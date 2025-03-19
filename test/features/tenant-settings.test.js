/**
 * Tenant Setting Use-cases
 */


describe('[Tenant Settings]', async () => {

    describe('@POST /tenant-settings', () => {
        it(' => Creating Tenant Setting ... ', (done) => {
            chai.request(express_application)
                .post('/tenant-settings')
                .set('Authorization', 'Bearer ' + __tenant_token)
                .send({
                    tenant: __tenant__id,
                    name: "Eid Day",
                    holiday_date: new Date().toString(),
                    surcharge: "yes",
                    surcharge_percentage: 5,
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __tenant_setting__id = res.body.item._id
                    done()
                })
        })
    })

    describe('@PUT /tenant-settings/{id}', () => {
        it(' => Updating Tenant Setting ... ', (done) => {
            chai.request(express_application)
                .put('/tenant-settings/' + __tenant_setting__id)
                .set('Authorization', 'Bearer ' + __tenant_token)
                .send({
                    tenant: __tenant__id,
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

    describe('@GET /tenant-settings', () => {
        it(' => Listing Tenant Settings ... ', (done) => {
            chai.request(express_application)
                .get('/tenant-settings')
                .set('Authorization', 'Bearer ' + __tenant_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /tenant-settings/{id}', () => {
        it(' => Get Single Tenant Setting ... ', (done) => {
            chai.request(express_application)
                .get('/tenant-settings/' + __tenant_setting__id)
                .set('Authorization', 'Bearer ' + __tenant_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    done()
                })
        })
    })

})