/**
 * Facility Use-cases
 */


describe('[Facilities]', async () => {

    describe('@POST /facilities', () => {
        it(' => Creating Facility ... ', (done) => {
            chai.request(express_application)
                .post('/facilities')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    tenant: __tenant__id,
                    name: 'Johny Piza Corner',
                    type: 'Restaurant',
                    address: '70 Jace Parade, Novellaston, Nebraska 4359, New Zeland',
                    contact: '+923695412354',
                    password: '123456',
                    contact_person_firstname: 'Bill',
                    contact_person_lastname: 'Howard',
                    gst_number: '14KOVPV2127A5Z7',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __facility__id = res.body.item._id
                    done()
                })
        })
    })

    describe('@PUT /facilities/{id}', () => {
        it(' => Updating Facility ... ', (done) => {
            chai.request(express_application)
                .put('/facilities/' + __facility__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    tenant: __tenant__id,
                    name: 'Johny Piza Corner',
                    type: 'Restaurant',
                    address: '70 Jace Parade, Novellaston, Nebraska 4359, New Zeland',
                    contact: '+923695412354',
                    password: '123456',
                    contact_person_firstname: 'Bill',
                    contact_person_lastname: 'Howard',
                    gst_number: '14KOVPV2127A5Z7',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /facilities', () => {
        it(' => Listing Facilities ... ', (done) => {
            chai.request(express_application)
                .get('/facilities')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /facilities/{id}', () => {
        it(' => Get Single Facility ... ', (done) => {
            chai.request(express_application)
                .get('/facilities/' + __facility__id)
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