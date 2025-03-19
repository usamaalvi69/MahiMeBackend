/**
 * Role Use-cases
 */


describe('[Roles]', async () => {

    describe('@POST /roles', () => {
        it(' => Creating Role ... ', (done) => {
            chai.request(express_application)
                .post('/roles')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    name: 'Test Role',
                    permissions: []
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('role')
                    __role__id = res.body.role._id
                    done()
                })
        })
    })

    describe('@PUT /roles/{id}', () => {
        it(' => Updating Role ... ', (done) => {
            chai.request(express_application)
                .put('/roles/' + __role__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    name: 'Test Role',
                    permissions: []
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /roles', () => {
        it(' => Listing Roles ... ', (done) => {
            chai.request(express_application)
                .get('/roles')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /roles/{id}', () => {
        it(' => Get Single Role ... ', (done) => {
            chai.request(express_application)
                .get('/roles/' + __role__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('role')
                    done()
                })
        })
    })

})