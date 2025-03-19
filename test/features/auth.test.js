/**
 * Auth use-cases
 * @dependencies
 * none
 */
describe('[Auth]', async () => {

    /**
     * Login Admin Account
     */
    describe('@POST /login', () => {
        it(' => returns admin token', (done) => {
            chai.request(express_application)
                .post('/login')
                .send({
                    email: __admin_username,
                    password: __admin_password
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('token')
                    __admin_token = res.body.token
                    done()
                })
        })
    })

})