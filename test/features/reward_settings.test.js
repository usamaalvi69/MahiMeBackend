/**
 * Reward Settings Templates Use-cases
 */


describe('[Reward Settings]', async () => {

    describe('@POST /rewards', () => {
        it(' => Creating Reward Settings ... ', (done) => {
            chai.request(express_application)
                .post('/rewards')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    from_amount: "1",
                    to_points: "0.1",
                    from_points: "1",
                    to_amount: "0.1"
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    done()
                })
        })
    })

    describe('@GET /rewards', () => {
        it(' => Listing Reward Settings ... ', (done) => {
            chai.request(express_application)
                .get('/rewards')
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