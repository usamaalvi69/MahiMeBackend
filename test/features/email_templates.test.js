/**
 * Email Templates Use-cases
 */


describe('[Email Templates]', async () => {

    describe('@POST /email-templates', () => {
        it(' => Creating/Updating Email Template ... ', (done) => {
            chai.request(express_application)
                .post('/email-templates')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    name: "Test Template",
                    subject: "Welcome",
                    body: "Hello Everyone, Thanks",
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __email_template_id = res.body.item._id
                    done()
                })
        })
    })

    describe('@POST /email-templates/mass', () => {
        it(' => Send Mass Email ... ', (done) => {
            chai.request(express_application)
                .post('/email-templates/mass')
                .set('Authorization', 'Bearer ' + __admin_token)
                .send({
                    tenants: [__tenant__id],
                    subject: "Test Group Email",
                    email_body: "This is triggerd via test case",
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    done()
                })
        })
    })

    describe('@GET /email-templates', () => {
        it(' => Listing Email Templates ... ', (done) => {
            chai.request(express_application)
                .get('/email-templates')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

})