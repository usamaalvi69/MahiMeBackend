/**
 * Notification Use-cases
 */


describe('[Notifications]', async () => {

    describe('@GET /notifications', () => {
        it(' => List Notifications ... ', (done) => {
            chai.request(express_application)
                .get('/notifications')
                .set('Authorization', 'Bearer ' + __tenant_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('notifications')
                    done()
                })
        })
    })

    describe('@GET /notifications/mark-all', () => {
        it(' => Mark Read All Notifications ... ', (done) => {
            chai.request(express_application)
                .get('/notifications/mark-all')
                .set('Authorization', 'Bearer ' + __tenant_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

})