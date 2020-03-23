[![Build Status](https://travis-ci.org/EmpyrNetwork/empyr_web.svg?branch=master)](https://travis-ci.org/EmpyrNetwork/empyr_web)
[![npm](https://img.shields.io/npm/v/empyr_web.svg)](https://www.npmjs.com/package/empyr_web)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Impression Tracking

## Introduction
In order to provide better visibility to merchants on consumer views and tracking through the conversion funnel Empyr has implemented a tracking mechanism to record the impressions that consumers make when viewing offers. This guide is intended for partners in the Empyr network to be able to leverage the impression tracking system.

## Overview
Much like traditional ad networks will leverage tracking pixels embedded in creative delivered through ad networks to deliver impression data Empyr has developed tracking technology to record impressions across the Empyr network.

Unlike traditional ad networks Empyr merchant content is typically consumed through APIs or through feeds delivered to partners by SFTP. Because of this it is necessary to request the cooperation of our partners in the embedding/display of the Empyr tracking technology.

Additionally, the goal of the tracking is to link the consumer profile (with associated card) with the impression data which can then be used to attribute purchases made with that card to the viewing of the merchant offer.

A high level description would be:

1. Partner page loads and displays offer
2. Partner page triggers impression pixel which includes:

   a. Partner id

   b. Empyr user id OR partner Empyr user token

   c. List of offer ids displayed on the page

3. Pixel/impression is loaded from Empyr servers and recorded
4. Empyr warehousing systems process the impression data for reporting to merchants

## The Pixel
The pixel that Empyr uses for tracking takes the following form:

https://t.mogl.com/t/t.png

It is capable of being supplied with the following parameters

Parameter| Required | Description
---------| -------- | -----------
pid | true | Partner id. This is the client key (NOT THE SECRET). Used to correlate the user data with the partner.
WEB_SEARCH_VIEW or WEB_DETAIL_VIEW | true | This is a list of offer ids and the context they appear in. For example the value could be WEB_DETAIL_VIEW=5554 or WEB_SEARCH_VIEW=5554,5556,5558 etc.
m | false | The empyr id of the user performing the view. This would be the value returned as the id for the user from the signupWithCard/signup APIs. This is used to tie the user to the impression for conversion metrics. u | false | The partner’s usertoken that was supplied with the signupWithCard/signup APIs. This can be used instead of the empyr id param for convenience.

## Tracker.js
Tracking.js is a javascript library that allows a partner to quickly and seamlessly add impression tracking to their site. Adding the following code to your sites template would be the easiest way to add tracking:

```html
<!-- Start Empyr -->
<script>
	window.empyr=window.empyr||function(){(empyr.q=empyr.q||[]).push(arguments)};empyr.l=+new Date;
	empyr( 'setup', 'CLIENT_ID', {m: EMPYR_UID, watch: true});
</script>
<script async src='//drlrrbp9w22xo.cloudfront.net/tracker.min.js'></script>
<!-- End Empyr -->
```

The above code will asynchronously load the Empyr tracking javascript and initialize it.

<br>
Alternatively, you can use npm to use a locally hosted version:
<br>
<br>
<b>npm install empyr_web</b>
<br>

Please note the following parameters:

1. CLIENT_ID -- This is your API key (NOT THE SECRET) which is used to identify the user as belonging to your application.

2. m: EMPYR_UID -- The EMPYR_UID would represent the UID of the user from the Empyr platform that is returned when you register a user in Empyr (e.g. through signupWithCard). Alternatively, you can provide “u: USER_TOKEN” where USER_TOKEN would be the user token that you provided to Empyr when registering the user. Please note that if a user IS NOT CURRENTLY LOGGED IN OR NOT SIGNED UP THIS CAN BE OMITTED.

3. watch:true -- This parameter is used to tell the Empyr.js to “watch” the document DOM for changes and will be discussed further below.

## Tracking
Once the tracking code has been loaded and setup the next step is to actually *TRACK* the offers being displayed. There are TWO mechanisms to do this:

<br>
<b>The Attribute Method</b>
Using the attribute approach is very straightforward. For any DOM element in the page where you are displaying an offer simply add the ‘eid=OFFER_ID’ where “OFFER_ID” represents the id of the offer being displayed.
<br>
<br>

``` html
<div class=”view” vw=”WEB_SEARCH_VIEW”>
    <div class=”offer” eid=”5554”>
        <div class=”name”>Taco Express</div>
        <div class=”discount”>Discount: 10%</div>
    </div>
    <div class=”offer” eid=”5556”>
        <div class=”name”>Pizza Nova</div>
        <div class=”discount”>Discount: 10%</div>
    </div>
</div>
```

When the page loads, the script will scan the document for the eid attribute and create a single pixel call that contains all the offer ids concatenated together (saving multiple pixel calls). The script will also try to detect the context that the offers are viewed in from the vw attribute. WEB_SEARCH_VIEW indicates that the offers were viewed as search results and WEB_DETAIL_VIEW indicates an offer being viewed in detail.

Additionally, if “watch:true” is supplied at the time of setup then the system will automatically monitor the DOM for changes (e.g. AJAX loads) and will make the appropriate pixel fires for the dynamically loaded content. If content WILL NOT be loaded by ajax then not supplying “watch:true” will have a small performance benefit as the script will not register a MutableObserver to process the DOM changes.

<br>
<b>Calling the “track” method</b>
If you don’t wish to use the attribute approach outlined earlier then it is always possible to call the tracking methods directly as in the examples below:

``` javascript
// Explicitly call the track function with the id of the offer, and the view context the offer appears in
empyr('track', “5554”, “WEB_DETAIL_VIEW” )
empyr('track', [“5554”,“5556”,”5558”], “WEB_SEARCH_VIEW” )
```

The advantage of the second call over the first is that there will be a single pixel fire to track impressions for 5554, 5556 and 5558, instead of three pixel fires.

<br>
<br>

#  Hosted Fields (BETA)


## Introduction

For partners who are not currently PCI compliant and would like to be subject to the minimum level of compliance (SAQ A) MOGL Hosted Fields is a very flexible card registration solution. At a high level the integration steps are:

1. Create a parent page where users will register cards.
2. In this page include the hosted fields javascript library.
3. Create a form/container which is where the script will construct an iframe that houses the single credit card input field.
4. On page load execute the HostedFields.setup() function call providing:

   a. Your application key (not the secret)

   b. The form HTML id.

   c. The container identifier (which will hold the card iframe)

   d. A userToken (explained further below)

5. The script will create an iframe within the specified container (this container should have a fixed height set).
6. The script will also takeover the form that submits details.


Upon user completion of the credit card details and submission of the form, the javascript will:


1. Intercept the submit event
2. Submit the card to Mogl.com with the associated user token
3. When the response is received any corresponding error/success will be delivered back to the parent page. This can be accomplished through the use of success/error callbacks. If those callbacks are not specified then the script will submit the parent form as well as include the registration details of the card or, in the event of error, do a standard javascript alert to the browser.

## UserToken

The userToken represents the user in the Mogl system. At a very high level the user is a container of registered card details. The email from the userToken will further be used when your application makes API requests to Mogl.com to retrieve user details or when Mogl.com sends transaction information back to your application.


The userToken is composed as follows:


email + ':' + expireTime_t + ':' + BASE64( hmacSha512( key, email + ':' + expireTime_t ) )


Please note the following field descriptions:

1. email -- The email to associate with the account. In test this must always contain “mogl” somewhere in the email.
2. expireTime_t -- The length of time the specified token is valid. Since this token is used to add cards to accounts it is recommended that this be no more than 1 hour in the future.
3. key -- Your client secret.

## RegisterDetails

Successful registration of the card will yield a REGISTER_DETAILS string which contains the information necessary for associating the user with the card identifier. The format of this registration string is as follows:


email + ':' + cardId + ':' + nonce + ':' + BASE64( hmacSha512( key, email + ':' + cardId + ':' + nonce ) )


The email/cardId relationship should be saved locally in your system so that you may properly link the card back to the user when Mogl sends your application transactions.

## Customization

There are two primary ways in which you can customize the look and feel of the registration form:
* Apply styles to the outside container (e.g. border colors etc.). You have nearly unlimited ability to customize the look of this since it is your parent page which controls this.
* Provide injected styles which can be used to customize the look of the “input” element that actually takes the card number. These are provided through configuration and the iframe builds a stylesheet from these params. Please note that for XSS protection there are a limited number of whitelisted properties supported:

<i>
"-moz-osx-font-smoothing", "-moz-transition", "-webkit-font-smoothing", "-webkit-transition", "color", "font", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-variant-alternates", "font-variant-caps", "font-variant-east-asian", "font-variant-ligatures", "font-variant-numeric", "font-weight", "line-height", "opacity", "outline", "text-shadow", "transition"
</i>

<br>
Below are the options that are available to the HostedFields.setup() call:

``` javascript
{
        id: undefined,                // The id of the form.
        onRegistered: undefined,        // The method to call when we have successfully registered.
        onError: undefined,                // The method to call in the event of an error,
        url: 'https://www.mogl.com',        // The url that will be used to construct the hosted fields.
        fields: {
                userDetails: undefined,        // The user token assigned to the user (email + ':' + expireTime_t + ':' + BASE64( hmacSha512( key, email + ':' + expireTime_t ) ))
                styles: {                        // Style the fields
                },
                cardNumber: {
                        selector: undefined,                // The selector to use for the cardNumber container.
                        placeHolder:  undefined        // The placeholder text to use.
                }
        }
};
```


## Example

``` html
<html>
        <head>
                <title>Test Hosted Fields</title>
                <script src='http://drlrrbp9w22xo.cloudfront.net/hostedFields.min.js'></script>
                <style>
                        .field-container {
                                height: 50px;
                                margin-bottom: 1em;
                                padding: 0 0.5em;
                                border: 1px solid #ddd;
                        }
                        .field-container.mogl-invalid {
                                border-color: tomato;
                        }
                        .field-container.mogl-valid {
                                border-color: limegreen;
                        }
                </style>
        </head>
        <body>
                <form id='testForm'>
                        <label for='card-number'>Card Number</label>
                        <div id='card-number' class='field-container'></div>
                        <input type='submit'/>
                </form>

                <script>
                        HostedFields.setup( 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'custom', {
                                id: 'testForm',
                                url: 'https://test.mogl.com',
                                fields: {
                                  userDetails: 'aaabbbccc@mogl.com:1438012870:V8r21YLFFPqjYkkdqtOPLAWg/Sq+u/bD+dZOM/aesRwv2uIn7rVOx/Jfiu3HGApMsAaqKXhmMtDfNU2Vyhj',
                                  styles: {
                                    'input' : {
                                      'color': '#0000FF'
                                    }
                                  },
                                  cardNumber: {
                                    selector: '#card-number'
                                  }
                                }
                        });
                </script>
        </body>
</html>
```
