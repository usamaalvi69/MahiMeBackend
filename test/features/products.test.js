/**
 * Product Use-cases
 */


describe('[Products]', async () => {

    describe('@POST /products', () => {
        it(' => Creating Product ... ', (done) => {
            chai.request(express_application)
                .post('/products')
                .set('content-type', 'multipart/form-data')
                .set('Authorization', 'Bearer ' + __admin_token)

                .attach('photos[]', fs.readFileSync(`${__dirname}/../storage/test.jpg`), 'test.jpg')

                .field('facility', __facility__id)
                .field('tenant', __tenant__id)
                .field('category', __category__id)

                .field('name', "Banana Shake")
                .field('description', "A banana is a curved, yellow fruit with a thick skin and soft sweet flesh. If you eat a banana every day for breakfast, your roommate might nickname you 'the monkey'. A banana is a tropical fruit that's quite popular all over the world.")
                .field('price', 6.22)
                .field('extra_note', '')
                .field('dietary_requirements', JSON.stringify(['Dairy Free', 'VG', 'GF']))
                .field('prep_time_from', 5)
                .field('prep_time_to', 6)

                .field('promotion_from', new Date().toString())
                .field('promotion_to', new Date().toString())
                .field('promotion_price', 6.22)
                .field('promotion_status', "inactive")

                .field('type', "beverage")
                .field('alcoholic', "no")

                .field('variations', JSON.stringify([{ name: 'Size', selection: 'single', options: [{ name: 'Single', price: 0 }, { name: 'Double', price: 5.13 }] }]))
                .field('status', "active")

                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('item')
                    __product__id = res.body.item._id
                    done()
                })
        })
    })

    describe('@PUT /products/{id}', () => {
        it(' => Updating Product ... ', (done) => {
            chai.request(express_application)
                .put('/products/' + __product__id)
                .set('content-type', 'multipart/form-data')
                .set('Authorization', 'Bearer ' + __admin_token)

                .field('facility', __facility__id)
                .field('tenant', __tenant__id)
                .field('category', __category__id)

                .field('name', "Banana Shake")
                .field('description', "A banana is a curved, yellow fruit with a thick skin and soft sweet flesh. If you eat a banana every day for breakfast, your roommate might nickname you 'the monkey'. A banana is a tropical fruit that's quite popular all over the world.")
                .field('price', 6.22)
                .field('extra_note', '')
                .field('dietary_requirements', JSON.stringify(['Dairy Free', 'VG', 'GF']))
                .field('prep_time_from', 5)
                .field('prep_time_to', 6)

                .field('promotion_from', new Date().toString())
                .field('promotion_to', new Date().toString())
                .field('promotion_price', 6.22)
                .field('promotion_status', "inactive")

                .field('type', "beverage")
                .field('alcoholic', "no")

                .field('variations', JSON.stringify([{ name: 'Size', selection: 'single', options: [{ name: 'Single', price: 0 }, { name: 'Double', price: 5.13 }] }]))
                .field('status', "active")
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@GET /products', () => {
        it(' => Listing Product ... ', (done) => {
            chai.request(express_application)
                .get('/products')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.list.should.be.a('array')
                    done()
                })
        })
    })

    describe('@GET /products/{id}', () => {
        it(' => Get Single Product ... ', (done) => {
            chai.request(express_application)
                .get('/products/' + __product__id)
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