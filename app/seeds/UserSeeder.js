module.exports = class UserSeeder {
    constructor() {
        this.user_model = resolveOnce('app.models.UserModel')
        this.role_model = resolveOnce('app.models.RoleModel')
    }

    async up() {
        var roles_permissions = permissions.all

        var global_role = ''
        let user_type = ['admin', 'employer', 'employee']

        for (let i = 0; i < user_type.length; i++) {
            let role_exists = await this.role_model.findOne({ name: user_type[i] })
            if (!role_exists) {
                let role = await this.role_model.create({
                    name: user_type[i],
                    permissions: roles_permissions
                })
                global_role = user_type[i] == 'admin' ? role._id : global_role
                console.log('Role seeded successfully', role)

            }
        }
        let user_exists = await this.user_model.find({
            type: "admin"
        })

        if (user_exists.length === 0) {
            await this.user_model.create({
                first_name: 'super',
                last_name: 'admin',
                email: 'apps@kwd.co.nz',
                password: auth.hashPassword('Mahi_me@1234', Config.app('salt')),
                type: 'admin',
                status: 'active',
                roles: global_role,
                photo: null,
                blocked_at: null,
                created_at: new Date(),
                updated_at: new Date()
            })
        } else {
            console.log('User already seeded.')
        }
    }
}
