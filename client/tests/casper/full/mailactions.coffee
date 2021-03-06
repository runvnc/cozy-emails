require = patchRequire global.require
init    = require("../common").init
utils   = require "utils.js"
x       = require('casper.js').selectXPath

casper.test.begin 'Test Message Actions', (test) ->
    init casper

    casper.start casper.cozy.startUrl, ->
        casper.evaluate ->
            #window.cozyMails.setSetting 'messagesPerPage', 100
            window.cozyMails.setSetting 'messageDisplayHTML', true
            window.cozyMails.setSetting 'messageDisplayImages', false
            window.cozyMails.setSetting 'displayConversation', false
            window.cozyMails.setSetting 'displayPreview', true
            window.cozyMails.setSetting 'messageConfirmDelete', true

    casper.then ->
        test.comment "Reply"
        casper.cozy.selectMessage "DoveCot", "Test Folder", "Re: troll", "20141106093513.GH5642@mail.cozy.io", ->
            test.assertEquals casper.fetchText('.conversation li.message.active .participants'), 'contact, Me, You', 'Participants list'
            test.assertDoesntExist '#email-compose', "No compose form"
            casper.click '.messageToolbox button.reply'
            casper.waitForSelector '#email-compose', ->
                test.pass "Compose form displayed"
                test.assertNotVisible '#compose-cc', 'Cc hidden'
                test.assertNotVisible '#compose-bcc', 'Bcc hidden'
                values = casper.getFormValues('#email-compose form')
                test.assertEquals values["compose-to"], "contact@cozycloud.cc", "Reply To"
                test.assertEquals values["compose-cc"], "", "Reply Cc"
                test.assertEquals values["compose-bcc"], "", "Reply Bcc"
                test.assertEquals values["compose-subject"], "Re: Re: troll", "Reply Subject"
                casper.click '.form-compose .btn-cancel'
                casper.waitWhileSelector '#email-compose', ->
                    test.pass "Compose closed"

    casper.then ->
        test.comment "Reply all"
        casper.cozy.selectMessage "DoveCot", "Test Folder", "Re: troll", "20141106093513.GH5642@mail.cozy.io", ->
            test.assertDoesntExist '#email-compose', "No compose form"
            casper.click '.messageToolbox button.reply-all'
            casper.waitForSelector '#email-compose', ->
                test.pass "Compose form displayed"
                test.assertVisible '#compose-cc', 'Cc visible'
                test.assertNotVisible '#compose-bcc', 'Bcc hidden'
                values = casper.getFormValues('#email-compose form')
                test.assertEquals values["compose-to"], "contact@cozycloud.cc", "Reply All To"
                test.assertEquals values["compose-cc"], '"Me" <me@cozycloud.cc>, "You" <you@cozycloud.cc>', "Reply All Cc"
                test.assertEquals values["compose-bcc"], "", "Reply All Bcc"
                test.assertEquals values["compose-subject"], "Re: Re: troll", "Reply Subject"
                casper.click '.form-compose .btn-cancel'
                casper.waitWhileSelector '#email-compose'

    casper.then ->
        test.comment "Forward"
        casper.cozy.selectMessage "DoveCot", "Test Folder", "Re: troll", "20141106093513.GH5642@mail.cozy.io", ->
            test.assertDoesntExist '#email-compose', "No compose form"
            casper.click '.messageToolbox button.forward'
            casper.waitForSelector '#email-compose', ->
                test.pass "Compose form displayed"
                test.assertNotVisible '#compose-cc', 'Cc hidden'
                test.assertNotVisible '#compose-bcc', 'Bcc hidden'
                values = casper.getFormValues('#email-compose form')
                test.assert values["compose-to"] is "", "Forward To"
                test.assert values["compose-cc"] is "", "Forward Cc"
                test.assert values["compose-bcc"] is "", "Forward Bcc"
                test.assert values["compose-subject"] is "Fwd: Re: troll", "Reply Subject"
                casper.click '.form-compose .btn-cancel'
                casper.waitWhileSelector '#email-compose'

    casper.then ->
        test.comment "Delete"
        confirm = ''
        casper.evaluate ->
            window.cozytest = {}
            window.cozytest.confirm = window.confirm
            window.confirm = (txt) ->
                window.cozytest.confirmTxt = txt
                return true
        casper.cozy.selectMessage "Gmail", "[Gmail]", null, (subject) ->
            infos = casper.getElementInfo '.message-list li.message.active'
            messageID = infos.attributes['data-message-id']
            casper.click '.messageToolbox button.trash'
            casper.waitWhileSelector ".message-list li.message[data-message-id='#{messageID}']", ->
                test.pass "Message #{subject} Moved"
                casper.cozy.selectMessage "Gmail", "Corbeille", subject, messageID, ->
                    test.pass 'Message is in Trash'
                    casper.click '.messageToolbox button.move'
                    boxSelector = '.messageToolbox [data-value="e7332094-e043-0156-0b5c-790219161c7a"]'
                    casper.waitUntilVisible boxSelector, ->
                        test.pass 'Move menu displayed'
                        casper.click boxSelector
                        casper.waitWhileSelector ".message-list li.message[data-message-id='#{messageID}']", ->
                            casper.cozy.selectMessage "Gmail", "[Gmail]", subject, messageID, ->
                                test.pass "Message moved back to original folder"

    casper.run ->
        test.done()
