# Using the BitPay plugin for Drupal 6 Ubercart

## Prerequisites
You must have a BitPay merchant account to use this plugin.  It's free to [sign-up for a BitPay merchant account](https://bitpay.com/start).


## Installation

Copy these files into sites/all/modules/ in your Drupal directory.

## Configuration

1. Create "Legacy API Key" in your BitPay merchant account dashboard:
  * Log into https://bitpay.com with your account username/password.
  * On the left side of the screen, choose **Settings**.
  * The menu will expand downward revealing a list of options. Choose the **Legacy API Keys** option.
  * On the right side of the page, click on the grey **+ Add New API Key** button to instantly create a new one.
  * Select and copy the entire string for the new API Key ID that you just created. It will look something like this: 43rp4rpa24d6Bz4BR44j8zL44PrU4npVv4DtJA4Kb8.
2. Now, log into your Ubercart administration area and go to **Administer > Site Building > Modules** to verify that the BitPay module is enabled under the **Ubercart - payment** section.
3. Under **Store Administration > Configuration > Payment Settings > Payment Methods**, enable the **BitPay** payment method, and then go to the BitPay settings menu.
4. Enter your Legacy API Key that you created & copied in Step 2 of these directions under the **Administrator** settings dropdown menu, and enter other settings as desired.
5. Select a transaction speed under General settings. This setting determines how quickly you will receive a payment confirmation from BitPay after an invoice is paid by a customer.
  * High: A confirmation is sent instantly once the payment has been received by the gateway.
  * Medium: A confirmation is sent after 1 block confirmation (~10 mins) by the bitcoin network.
  * Low: A confirmation is sent after the usual 6 block confirmations (~1 hour) by the bitcoin network.

## Usage

When a client chooses the BitPay payment method, they will be presented with an invoice showing a button they will have to click on in order to pay their order.  Upon requesting to pay their order, the system takes the client to a full-screen bitpay.com invoice page where the client is presented with payment instructions.  Once payment is received, a link is presented to the shopper that will return them to your website.

**Note:** Don't worry!  A payment will automatically update your Ubercart store whether or not the customer returns to your website after they've paid the invoice.

**Note:** This extension does not provide a means of automatically pulling a current BTC exchange rate for presenting BTC prices to shoppers.
