/**
 * Tenant Use-cases
 */

describe('[Tenants]', async () => {

    describe('@POST /tenants', () => {
        it(' => Creating Tenant ... ', (done) => {
            chai.request(express_application)
                .post('/tenants')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@test.com',
                    phone: '+923695412354',
                    password: '123456',
                    business_address: '70 Jace Parade, Novellaston, Nebraska 4359, New Zeland',
                    gst_number: '14KOVPV2127A5Z7',
                    contact_person_firstname: 'Bill',
                    contact_person_lastname: 'Howard',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __tenant__id = res.body.item._id
                    __tenant_username = res.body.item.email
                    __tenant_password = '123456'
                    done()
                })
        })
    })

    describe('@PUT /tenants/{id}', () => {
        it(' => Updating Tenant ... ', (done) => {
            chai.request(express_application)
                .put('/tenants/' + __tenant__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@test.com',
                    phone: '+923695412354',
                    password: '123456',
                    business_address: '70 Jace Parade, Novellaston, Nebraska 4359, New Zeland',
                    gst_number: '14KOVPV2127A5Z7',
                    contact_person_firstname: 'Bill',
                    contact_person_lastname: 'Howard',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /tenants', () => {
        it(' => Listing Tenants ... ', (done) => {
            chai.request(express_application)
                .get('/tenants')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /tenants/{id}', () => {
        it(' => Get Single Tenant ... ', (done) => {
            chai.request(express_application)
                .get('/tenants/' + __tenant__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    done()
                })
        })
    })

    describe('@DELETE /tenants/{id}', () => {
        it(' => Deleteing Tenant (Archived) ... ', (done) => {
            chai.request(express_application)
                .delete('/tenants/' + __tenant__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    done()
                })
        })
    })

    describe('@PUT /tenants/{id}/restore', () => {
        it(' => Restoring Tenant (Archived) ... ', (done) => {
            chai.request(express_application)
                .put('/tenants/' + __tenant__id + '/restore')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    done()
                })
        })
    })

    describe('@PUT /tenants/{id}/lock', () => {
        it(' => Locking Tenant ... ', (done) => {
            chai.request(express_application)
                .put('/tenants/' + __tenant__id + '/lock')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    status: 'yes'
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    done()
                })
        })
    })

    describe('@PUT /tenants/{id}/lock', () => {
        it(' => Unlocking Tenant ... ', (done) => {
            chai.request(express_application)
                .put('/tenants/' + __tenant__id + '/lock')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    status: 'no'
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    done()
                })
        })
    })

    /**
     * Login Tenant Account
     */
    describe('@POST /login', () => {
        it(' => returns tenant token', (done) => {
            chai.request(express_application)
                .post('/login')
                .send({
                    email: __tenant_username,
                    password: __tenant_password
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('token')
                    __tenant_token = res.body.token
                    done()
                })
        })
    })

})