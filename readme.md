[ ![Codeship Status for mzipagang/empyr_web](https://app.codeship.com/projects/c70ffbe0-0d70-0136-1ce4-3a8e8d4354bb/status?branch=master)](https://app.codeship.com/projects/282068)

# Hosted Fields (BETA)

<b>Introduction</b>

For partners who are not currently PCI compliant and would like to be subject to the minimum level of compliance (SAQ A) MOGL Hosted Fields is a very flexible card registration solution. At a high level the integration steps are:

1. Create a parent page where users will register cards.
2. In this page include the hosted fields javascript library.
3. Create a form/container which is where the script will construct an iframe that houses the single credit card input field. 
4. On page load execute the Mogl.setup() function call providing:

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

<br>
<b>UserToken</b>


The userToken represents the user in the Mogl system. At a very high level the user is a container of registered card details. The email from the userToken will further be used when your application makes API requests to Mogl.com to retrieve user details or when Mogl.com sends transaction information back to your application.


The userToken is composed as follows:


email + ':' + expireTime_t + ':' + BASE64( hmacSha512( key, email + ':' + expireTime_t ) )


Please note the following field descriptions:

1. email -- The email to associate with the account. In test this must always contain “mogl” somewhere in the email.
2. expireTime_t -- The length of time the specified token is valid. Since this token is used to add cards to accounts it is recommended that this be no more than 1 hour in the future.
3. key -- Your client secret.

<br>
<b>RegisterDetails</b>


Successful registration of the card will yield a REGISTER_DETAILS string which contains the information necessary for associating the user with the card identifier. The format of this registration string is as follows:


email + ':' + cardId + ':' + nonce + ':' + BASE64( hmacSha512( key, email + ':' + cardId + ':' + nonce ) )


The email/cardId relationship should be saved locally in your system so that you may properly link the card back to the user when Mogl sends your application transactions.

<br>
<b>Customization</b>

There are two primary ways in which you can customize the look and feel of the registration form:
* Apply styles to the outside container (e.g. border colors etc.). You have nearly unlimited ability to customize the look of this since it is your parent page which controls this.
* Provide injected styles which can be used to customize the look of the “input” element that actually takes the card number. These are provided through configuration and the iframe builds a stylesheet from these params. Please note that for XSS protection there are a limited number of whitelisted properties supported:

<i>
"-moz-osx-font-smoothing", "-moz-transition", "-webkit-font-smoothing", "-webkit-transition", "color", "font", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-variant-alternates", "font-variant-caps", "font-variant-east-asian", "font-variant-ligatures", "font-variant-numeric", "font-weight", "line-height", "opacity", "outline", "text-shadow", "transition"
</i><br>


Below are the options that are available to the Mogl.setup() call:

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


<br>
<b>Example</b>

``` html
<html>
        <head>
                <title>Test Hosted Fields</title>
                <script src='https://test.mogl.com/mstatic/partner/mogl.js'></script>
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
                        Mogl.setup( 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'custom', { 
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
