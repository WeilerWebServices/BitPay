BitPay Translations
===================

This project is used to organize the language translation of BitPay.com, a Bitcoin payment
processor.  Currently, only the shopping cart, invoice/receipt and checkout now portions of
BitPay.com are enabled for translation.  While the entire site is not yet translatable, the payment
processing portion that buyers intereact with is translatable.

BitPay.com detects the preferred language from the user's browser or operating system language
settings.  It does so using the HTTP Accept-Language header.  If one of the users' preferred
languages is supported, the users' session will be set to the most preferred and supported
language.

To assist in translating and testing, the user can also override the browser and operating system
setting by setting the "lang" query parameter in the URL.  If a user wanted to see the Finnish
translation, they would append "&lang=fi" to the URL.  This will set the user's session to the
Finnish translation.  To revert back to the browser and operating system setting, the user can
append "&lang=reset".  There is currently no interactive (GUI) method of changing the language
setting.

Simple localization of numbers is also supported.  Numeric formatting is determined based on the
language & region (locale) setting.  The file "numbers.json" controls the mapping of languages &
regions to numeric formats.  The decimal and group separator characters are determined based on the
locale setting.  NOTE: the formatting of numeric input fields is usually controlled by the browser
or operating system setting rather than the web page language setting.  This means that if the
browser or operating system setting is different from the web session setting, numbers will be
displayed using a different convention than is used for numeric input fields.

In each of the language folders, there is a file called "strings-auto.json".  With the exception
of the English (en) translation, these files are auto generated translations and should not be 
modified (except using the auto translation tool).  Some language folders have a file called
"strings.json", which contains manual translations.  These manual translations override the
translations in the auto generated translation file.  Additionally, some languages contain a
subfolder with region specific overrides.  This enables region specific dialects to be accommodated.
If a file called "strings.json" is found in a region specific subfolder, the translations in it will
override those found in the language generic translation files when the website is viewed with that
language and region setting.

Note, while there are many translations present in this project, only translations that have been
manually reviewed and corrected are active on the site. 
