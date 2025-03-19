/**
 * General Use-cases
 */


describe('[General]', async () => {

    describe('@POST /auth/change-password', () => {
        it(' => Change Password ... ', (done) => {
            chai.request(express_application)
                .post('/auth/change-password')
                .set('Authorization', 'Bearer ' + __tenant_token)
                .send({
                    current_password: '123456',
                    new_password: '123456'
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

})