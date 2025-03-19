/**
 * Staff Use-cases
 * facility: "mongoId|required",
                first_name: "string|required",
                last_name: "string|required",
                email: "email|required|unique:UserModel.email",
                phone: "string|required",
                password: "string|required",
                designation: "string|required"
 */


describe('[Staff]', async () => {

    describe('@POST /staff', () => {
        it(' => Creating Staff ... ', (done) => {
            chai.request(express_application)
                .post('/staff')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    facility: __facility__id,
                    first_name: 'Chris',
                    last_name: 'Bagger',
                    email: 'chris.bagger@test.com',
                    phone: '+923695412354',
                    password: '123456',
                    designation: 'Cheff',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('staff')
                    __staff__id = res.body.staff._id
                    done()
                })
        })
    })

    describe('@PUT /staff/{id}', () => {
        it(' => Updating Staff ... ', (done) => {
            chai.request(express_application)
                .put('/staff/' + __staff__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    facility: __facility__id,
                    first_name: 'Chris',
                    last_name: 'Bagger',
                    email: 'chris.bagger@test.com',
                    phone: '+923695412354',
                    password: '123456',
                    designation: 'Cheff',
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /staff', () => {
        it(' => Listing Staff ... ', (done) => {
            chai.request(express_application)
                .get('/staff')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /staff/{id}', () => {
        it(' => Get Single Staff ... ', (done) => {
            chai.request(express_application)
                .get('/staff/' + __staff__id)
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