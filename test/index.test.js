/**
 * Define the environment you wan to run test cases
 */
process.env.DEBUG = false

/**
 * Global settings to skip following while booting up Nodvel in test cases
 * Hooks: Recommended not to be skipped
 * Server: Recommended to be skipped, as "chai" package will create it's own server for testing
 * Token: Just a global variable to store logged in token for protected route testing
 */
global.__skip_hooks = false
global.__skip_server = true

/**
 * Loading up some require npm packages for testing
 */

global.chai = require('chai')
global.chai_http = require('chai-http')
global.fs = require('fs')
global.should = chai.should()
global.expect = require('chai').expect

chai.use(chai_http)

/**
 * Booting up framework
 */

const Application = require('../core/application.js')
new Application().run()

/**
 * Starting test cases in order below
 */

/*
* Admin Authentication
*/
global.__admin_username = 'admin@mahi_me.com'
global.__admin_password = '123456'
global.__admin_token = ''
require('./features/auth.test')

/**
 * Roles
 */
global.__role__id = ''
require('./features/roles.test')

/**
 * Tenants
 */
global.__tenant_username = ''
global.__tenant_password = ''
global.__tenant_token = ''
global.__tenant__id = ''
require('./features/tenants.test')

/**
 * Facilities
 */
global.__facility__id = ''
require('./features/facilities.test')

/**
 * Categories
 */
global.__category__id = ''
require('./features/categories.test')

/**
 * Staff
 */
global.__staff__id = ''
require('./features/staff.test')

/**
 * Tables
 */
global.__table__id = ''
require('./features/tables.test')

/**
 * Products
 */
global.__product__id = ''
require('./features/products.test')

/**
 * Customers
 */
global.__customer_username = ''
global.__customer_token = ''
global.__customer__id = ''
global.__customer__stripe_customer_id = ''
global.__customer__stripe_payment_method_id = ''
require('./features/customers.test')

/**
 * Tabs
 * @todo skipped join tab for now with second customer
 */
// global.__tab__id = ''
// require('./features/tabs.test')

/**
 * Settings
 */
global.__setting__id = ''
require('./features/settings.test')

/**
 * Tenant Settings
 */
global.__tenant_setting__id = ''
require('./features/tenant-settings.test')

/**
 * Dashboards
 */
require('./features/dashboard.test')

/**
 * Notifications
 */
require('./features/notifications.test')

/**
 * General
 */
require('./features/general.test')

/**
 * Reward Settings
 */
require('./features/reward_settings.test')

/**
 * Email Templates
 */
global.__email_template_id = ''
require('./features/email_templates.test')

/**
 * Orders
 */
global.__order_id = ''
global.__order_id2 = ''
require('./features/orders.test')

/**
 * Customer Flow
 * 1. ScanQR/Get table & facility info
 * 
 * 2. Single Tab Scenario
 * 2.1. Create Tab
 * 2.2. Sign up
 * 2.3. Add Card
 * 2.4. Order Item
 * 2.5. Pay Order
 * 2.6. Close Tab
 * 
 * 3. Group Tab Scenario (Equally Shared)
 * 3.1. Create Tab
 * 3.2. Sign up (customer1)
 * 3.3. Add Card (customer1)
 * 3.4. Order Item (customer1)
 * 3.5. Share Tab (customer1)
 * 3.6. Sign up (customer2)
 * 3.7. Add Card (customer2)
 * 3.8. Order Item (customer2)
 * 3.9. Pay Orders (customer1)
 * 3.10. Pay Orders (customer2)
 * 3.11. Close Tab (customer1)
 * 
 * 4. Group Tab Scenario (Manually Shared)
 * 4.1. Create Tab
 * 4.2. Sign up (customer1)
 * 4.3. Add Card (customer1)
 * 4.4. Order Item (customer1)
 * 4.5. Share Tab (customer1)
 * 4.6. Sign up (customer2)
 * 4.7. Add Card (customer2)
 * 4.8. Order Item (customer2)
 * 4.9. Pay Orders (customer1)
 * 4.10. Pay Orders (customer2)
 * 4.11. Close Tab (customer1)
 * 
 * 5. Dine In
 * 5.1. ScanQR/Get table & facility info
 * 5.2. Start Dine In Flow
 * 5.3. Order Item
 * 5.4. Sign up
 * 5.5. Add Card
 * 5.6. Pay Order
 * 
 * 6. Takeaway
 * 6.1. ScanQR/Get table & facility info
 * 6.2. Start Takeaway  Flow
 * 6.3. Order Item
 * 6.4. Sign up
 * 6.5. Add Card
 * 6.6. Pay Order
 * 
 */


/**
 * Closing with removal of test data
 */
require('./features/close.test')
return