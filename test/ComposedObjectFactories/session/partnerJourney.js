var expect = require('expect.js');
var buildPartnerJourney = require('../../../lib/ComposedObjectFactories/session/partnerJourney');

describe('buildPartnerJourney', function () {
    it('does not fail when there are no requests', function () {
        expect(buildPartnerJourney({
            events: []
        })).to.eql({});
    });

    describe('logging partner codes', function () {
        it('logs unique partner codes in the requests', function () {
            var partnerJourney = buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request"
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=2398"
                    }
                }]
            });
            expect(partnerJourney.order).to.eql('NOPARTNERCODE,partner=1301,partner=2398');
            expect(partnerJourney.number).to.eql(3);
        });

        it('log partner codes in the order they were set', function () {
            var partnerJourney = buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=2398"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }]
            });
            expect(partnerJourney.order).to.eql('partner=1301,partner=2398,partner=1301');
            expect(partnerJourney.number).to.eql(3);
        });

        it('logs "NOPARTNERCODE" as a partner code if the partner code header disappears', function () {
            var partnerJourney = buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request"
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request"
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=2398"
                    }
                }]
            });
            expect(partnerJourney.order).to.eql('NOPARTNERCODE,partner=1301,NOPARTNERCODE,partner=2398');
            expect(partnerJourney.number).to.eql(4);
        });
    });

    describe('changed', function () {
        it('logs changed as true if the partner code has changed from the previous request', function () {
            expect(buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request"
                }, {
                    "type": "lr_varnish_request"
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }]
            }).changed).to.eql(true);
        });

        it('logs changed as false if the partner code has not changed from the previous request', function () {
            expect(buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }]
            }).changed).to.eql(false);
        });
    });
});
