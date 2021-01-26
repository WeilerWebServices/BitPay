<?php

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2011-2015 BitPay
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @package paymentMethod
 */
class bitpay
{
    public $code, $title, $description, $enabled, $payment;

    public function log($contents)
    {
        error_log($contents);
    }

    // class constructor
    public function bitpay()
    {
        global $order;
        $this->code = 'bitpay';
        $this->title = MODULE_PAYMENT_BITPAY_TEXT_TITLE;
        $this->description = MODULE_PAYMENT_BITPAY_TEXT_DESCRIPTION;
        $this->sort_order = MODULE_PAYMENT_BITPAY_SORT_ORDER;
        $this->enabled = ((MODULE_PAYMENT_BITPAY_STATUS == 'True') ? true : false);

        if (defined('MODULE_PAYMENT_BITPAY_ORDER_STATUS_ID') && (int) MODULE_PAYMENT_BITPAY_ORDER_STATUS_ID > 0) {
            $this->order_status = MODULE_PAYMENT_BITPAY_ORDER_STATUS_ID;
            $payment = 'bitpay';
        } else if ($payment == 'bitpay') {
            $payment = '';
        }

        if (is_object($order)) {
            $this->update_status();
        }

        $this->email_footer = MODULE_PAYMENT_BITPAY_TEXT_EMAIL_FOOTER;
    }

    // class methods
    public function update_status()
    {
        global $db;
        global $order;

        // check zone
        if (($this->enabled == true) && ((int) MODULE_PAYMENT_BITPAY_ZONE > 0)) {
            $check_flag = false;
            $check = $db->Execute("select zone_id from " . TABLE_ZONES_TO_GEO_ZONES . " where geo_zone_id = '" . intval(MODULE_PAYMENT_BITPAY_ZONE) . "' and zone_country_id = '" . intval($order->billing['country']['id']) . "' order by zone_id");
            while (!$check->EOF) {
                if ($check->fields['zone_id'] < 1) {
                    $check_flag = true;
                    break;
                } elseif ($check->fields['zone_id'] == $order->billing['zone_id']) {
                    $check_flag = true;
                    break;
                }
                $check->MoveNext();
            }

            if ($check_flag == false) {
                $this->enabled = false;
            }
        }

        // check currency
        $currencies = array_map('trim', explode(",", MODULE_PAYMENT_BITPAY_CURRENCIES));

        if (array_search($order->info['currency'], $currencies) === false) {
            $this->enabled = false;
        }

        // check that api key is not blank based on the env set
        if (MODULE_PAYMENT_BITPAY_STATUS_ENV == 'True') {
            if (!MODULE_PAYMENT_BITPAY_APIKEY or !strlen(MODULE_PAYMENT_BITPAY_APIKEY)) {
                $this->enabled = false;
            }
        } else {

            if (!MODULE_PAYMENT_BITPAY_APIKEY_DEV or !strlen(MODULE_PAYMENT_BITPAY_APIKEY_DEV)) {
                $this->enabled = false;
            }
        }

    }

    public function javascript_validation()
    {
        return false;
    }

    public function selection()
    {
        return array('id' => $this->code,
            'module' => $this->title);
    }

    public function pre_confirmation_check()
    {
        return false;
    }

    // called upon requesting step 3
    public function confirmation()
    {
        return false;
    }

    // called upon requesting step 3 (after confirmation above)
    public function process_button()
    {
        return false;
    }

    // called upon clicking confirm
    public function before_process()
    {
        return false;
    }

    // called upon clicking confirm (after before_process and after the order is created)
    public function after_process()
    {
        global $insert_id, $order, $db;

        //$insert_id must resemble an integer or else we can't match it into the db
        if (!preg_match('/^\d+$/', $insert_id)) {
            $this->log('after_process(). The $insert_id global is not set properly! Please ensure that: includes/modules/checkout_process.php properly sets $insert_id.');
            throw new Exception('payment method failed');
        }
        require_once 'bitpay/bp_lib.php';

        // change order status to value selected by merchant
        $db->Execute("update " . TABLE_ORDERS . " set orders_status = " . intval(MODULE_PAYMENT_BITPAY_UNPAID_STATUS_ID) . " where orders_id = " . intval($insert_id));

        $options = array(
            'physical' => $order->content_type == 'physical' ? 'true' : 'false',
            'currency' => $order->info['currency'],
            'buyerName' => $order->customer['firstname'] . ' ' . $order->customer['lastname'],
            'extendedNotifications' => 'true',
            'notificationURL' => zen_href_link('bitpay_callback.php', $parameters = '', $connection = 'NONSSL', $add_session_id = true, $search_engine_safe = true, $static = true),
            'redirectURL' => zen_href_link('account'),
            'transactionSpeed' => MODULE_PAYMENT_BITPAY_TRANSACTION_SPEED,
            
        );

        #test or prod
        #'apiKey' => MODULE_PAYMENT_BITPAY_APIKEY,
        if (MODULE_PAYMENT_BITPAY_STATUS_ENV == 'True') {
            $options['apiKey'] = MODULE_PAYMENT_BITPAY_APIKEY;
            $options['env'] = 'Prod';
        } else {
            $options['apiKey'] = MODULE_PAYMENT_BITPAY_APIKEY_DEV;
            $options['env'] = 'Test';
        }

        $invoice = bpCreateInvoice($insert_id, $order->info['total'], $insert_id, $options);

        if (!is_array($invoice) or array_key_exists('error', $invoice)) {

            $this->log('createInvoice error ' . var_export($invoice['error'], true));
            zen_remove_order($insert_id, $restock = true);
            // unfortunately, there's not a good way of telling the customer that it's hosed.  Their cart is still full so they can try again w/ a different payment option.
        } else {
            $_SESSION['cart']->reset(true);
            zen_redirect($invoice['data']['url']);
        }

        return false;
    }

    public function get_error()
    {
        return false;
    }

    public function check()
    {
        global $db;

        if (!isset($this->_check)) {
            $check_query = $db->Execute("select configuration_value from " . TABLE_CONFIGURATION . " where configuration_key = 'MODULE_PAYMENT_BITPAY_STATUS'");
            $this->_check = $check_query->RecordCount();
        }

        return $this->_check;
    }

    public function install()
    {
        global $db, $messageStack;

        if (defined('MODULE_PAYMENT_BITPAY_STATUS')) {
            $messageStack->add_session('BitPay Checkout module already installed.', 'error');
            zen_redirect(zen_href_link(FILENAME_MODULES, 'set=payment&module=bitpay', 'NONSSL'));
            return 'failed';
        }

        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, set_function, date_added) "
            . "values ('Enable BitPay Checkout Module', 'MODULE_PAYMENT_BITPAY_STATUS', 'True', 'Do you want to accept cryptocurrency payments via BitPay.com?', '6', '0', 'zen_cfg_select_option(array(\'True\', \'False\'), ', now());");

        //Sandbox or Production

        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, set_function, date_added) "
            . "values ('Production Environment', 'MODULE_PAYMENT_BITPAY_STATUS_ENV', 'False', 'Set to TRUE to use our Production environment, otherwise default to Sandbox', '6', '0', 'zen_cfg_select_option(array(\'True\', \'False\'), ', now());");

        #production key
        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, date_added) "
            . "values ('Production API Key', 'MODULE_PAYMENT_BITPAY_APIKEY', '', 'Enter you PRODUCTION API Key which you generated at https://bitpay.com/dashboard/merchant/api-tokens', '6', '0', now());");

        #sandbox key
        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, date_added) "
            . "values ('Sandbox API Key', 'MODULE_PAYMENT_BITPAY_APIKEY_DEV', '', 'Enter you DEVELOPMENT API Key which you generated at https://test.bitpay.com/dashboard/merchant/api-tokens', '6', '0', now());");

        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, set_function, date_added) "
            . "values ('Transaction speed', 'MODULE_PAYMENT_BITPAY_TRANSACTION_SPEED', 'low', 'At what speed do you want the transactions to be considered confirmed?', '6', '0', 'zen_cfg_select_option(array(\'high\', \'medium\', \'low\'),', now());");

        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, set_function, use_function, date_added) "
            . "values ('Unpaid Order Status', 'MODULE_PAYMENT_BITPAY_UNPAID_STATUS_ID', '" . intval(DEFAULT_ORDERS_STATUS_ID) . "', 'Automatically set the status of unpaid orders to this value.', '6', '0', 'zen_cfg_pull_down_order_statuses(', 'zen_get_order_status_name', now())");

        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, set_function, use_function, date_added) "
            . "values ('Paid Order Status', 'MODULE_PAYMENT_BITPAY_PAID_STATUS_ID', '2', 'Automatically set the status of paid orders to this value.', '6', '0', 'zen_cfg_pull_down_order_statuses(', 'zen_get_order_status_name', now())");

        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, date_added) "
            . "values ('Currencies', 'MODULE_PAYMENT_BITPAY_CURRENCIES', 'BTC, USD, EUR, GBP, AUD, BGN, BRL, CAD, CHF, CNY, CZK, DKK, HKD, HRK, HUF, IDR, ILS, INR, JPY, KRW, LTL, LVL, MXN, MYR, NOK, NZD, PHP, PLN, RON, RUB, SEK, SGD, THB, TRY, ZAR', 'Only enable BitPay payments if one of these currencies is selected (note: currency must be supported by BitPay.com).', '6', '0', now())");

        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, use_function, set_function, date_added) "
            . "values ('Payment Zone', 'MODULE_PAYMENT_BITPAY_ZONE', '0', 'If a zone is selected, only enable this payment method for that zone.', '6', '2', 'zen_get_zone_class_title', 'zen_cfg_pull_down_zone_classes(', now())");

        $db->Execute("insert into " . TABLE_CONFIGURATION . " (configuration_title, configuration_key, configuration_value, configuration_description, configuration_group_id, sort_order, date_added) "
            . "values ('Sort order of display.', 'MODULE_PAYMENT_BITPAY_SORT_ORDER', '0', 'Sort order of display. Lowest is displayed first.', '6', '2', now())");
    }

    public function remove()
    {
        global $db;
        $db->Execute("delete from " . TABLE_CONFIGURATION . " where configuration_key in ('" . implode("', '", $this->keys()) . "')");
    }

    public function keys()
    {
        return array(
            'MODULE_PAYMENT_BITPAY_EXTENSION_VERSION',
            'MODULE_PAYMENT_BITPAY_STATUS',
            'MODULE_PAYMENT_BITPAY_STATUS_ENV',
            'MODULE_PAYMENT_BITPAY_APIKEY',
            'MODULE_PAYMENT_BITPAY_APIKEY_DEV',
            'MODULE_PAYMENT_BITPAY_TRANSACTION_SPEED',
            'MODULE_PAYMENT_BITPAY_UNPAID_STATUS_ID',
            'MODULE_PAYMENT_BITPAY_PAID_STATUS_ID',
            'MODULE_PAYMENT_BITPAY_SORT_ORDER',
            'MODULE_PAYMENT_BITPAY_ZONE',
            'MODULE_PAYMENT_BITPAY_CURRENCIES',
        );
    }
}
