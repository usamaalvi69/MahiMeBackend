/**
 * Close use-cases
 * @dependencies
 * none
 */
describe('[Rollback]', async () => {

    describe('@DELETE /tenants/{id}/permanent', () => {
        it(' => Deleting Tenant ... ', (done) => {
            chai.request(express_application)
                .delete('/tenants/' + __tenant__id + '/permanent')
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /facilities/{id}', () => {
        it(' => Deleting Facility ... ', (done) => {
            chai.request(express_application)
                .delete('/facilities/' + __facility__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /categories/{id}', () => {
        it(' => Deleting Category ... ', (done) => {
            chai.request(express_application)
                .delete('/categories/' + __category__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /staff/{id}', () => {
        it(' => Deleting Staff ... ', (done) => {
            chai.request(express_application)
                .delete('/staff/' + __staff__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /tables/{id}', () => {
        it(' => Deleting Table ... ', (done) => {
            chai.request(express_application)
                .delete('/tables/' + __table__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /products/{id}', () => {
        it(' => Deleting Product ... ', (done) => {
            chai.request(express_application)
                .delete('/products/' + __product__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /roles/{id}', () => {
        it(' => Deleting Role ... ', (done) => {
            chai.request(express_application)
                .delete('/roles/' + __role__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /customers/{id}', () => {
        it(' => Deleting Customer ... ', (done) => {
            chai.request(express_application)
                .delete('/customers/' + __customer__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    // describe('@PUT /tabs/{id}/close', () => {
    //     it(' => First Closing Tab ... ', (done) => {
    //         chai.request(express_application)
    //             .put('/tabs/' + __tab__id + '/close')
    //             .set('Authorization', 'Bearer ' + __admin_token)
    //             .send({
    //                 customer: __customer__id,
    //                 new_limit: 150,
    //             })
    //             .end((err, res) => {
    //                 res.should.have.status(200)
    //                 res.body.should.be.a('object')
    //                 res.body.should.have.property('item')
    //                 done()
    //             })
    //     })
    // })

    // describe('@DELETE /tabs/{id}', () => {
    //     it(' => Deleting Tab ... ', (done) => {
    //         chai.request(express_application)
    //             .delete('/tabs/' + __tab__id)
    //             .set('Authorization', 'Bearer ' + __admin_token)
    //             .end((err, res) => {
    //                 res.should.have.status(200)
    //                 done()
    //             })
    //     })
    // })

    describe('@DELETE /settings/{id}', () => {
        it(' => Deleting Setting ... ', (done) => {
            chai.request(express_application)
                .delete('/settings/' + __setting__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /tenant-settings/{id}', () => {
        it(' => Deleting Tenant Setting ... ', (done) => {
            chai.request(express_application)
                .delete('/tenant-settings/' + __tenant_setting__id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /email-templates/{id}', () => {
        it(' => Deleting Email Template ... ', (done) => {
            chai.request(express_application)
                .delete('/email-templates/' + __email_template_id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /orders/{id}', () => {
        it(' => Deleting Order ... ', (done) => {
            chai.request(express_application)
                .delete('/orders/' + __order_id)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('@DELETE /orders/{id}', () => {
        it(' => Deleting Order ... ', (done) => {
            chai.request(express_application)
                .delete('/orders/' + __order_id2)
                .set('Authorization', 'Bearer ' + __admin_token)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

})