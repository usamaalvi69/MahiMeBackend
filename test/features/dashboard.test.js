/**
 * Dashboard Use-cases
 */


describe('[Dashboards]', async () => {

    describe('@GET /dashboard/tenant', () => {
        it(' => Showing Tenant Dashboard ... ', (done) => {
            chai.request(express_application)
                .get('/dashboard/tenant')
                .set('Authorization', 'Bearer ' + __tenant_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('total_facilities')
                    res.body.should.have.property('total_orders')
                    res.body.should.have.property('total_sales')
                    res.body.should.have.property('total_customers')
                    res.body.should.have.property('total_products')
                    done()
                })
        })
    })

    describe('@GET /dashboard/admin', () => {
        it(' => Showing Admin Dashboard ... ', (done) => {
            chai.request(express_application)
                .get('/dashboard/admin')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('total_facilities')
                    res.body.should.have.property('total_orders')
                    res.body.should.have.property('total_sales')
                    res.body.should.have.property('total_customers')
                    res.body.should.have.property('total_tenants')
                    done()
                })
        })
    })

})