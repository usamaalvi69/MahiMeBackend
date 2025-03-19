
/**
 * @class NotificationService
 * @description Service for notifications
 */
module.exports = class NotificationService {

    constructor(app) {
        this.user_model = resolveOnce('app.models.UserModel')        
        this.notification_model = resolveOnce('app.models.NotificationModel')        
        // this.project_model = resolveOnce('app.models.ProjectModel')        
    }

    async inform(name, message, link) {
        let users = await this.user_model.find({ leave_approver: 'yes' })
        for (let i = 0; i < users.length; i++) {
            const user = users[i]
            await this.informUser(user._id, name, message, link)
        }
    }

    async informUser(user, name, message, link) {
        await this.notification_model.create({
            user: user, 
            name: name,
            message: message,
            link: link,
            seen: 0
        })
        return true
    }

    async informUsers(users, name, message, link) {
        for (let i = 0; i < users.length; i++) {
            await this.notification_model.create({
                user: users[i], 
                name: name,
                message: message,
                link: link,
                seen: 0
            })
        }
        return true
    }

    async informStaff(name, message, link) {
        let staff = await this.user_model.find({ type: 'user' })
        for (let i = 0; i < staff.length; i++) {
            const u = staff[i]            
            await this.notification_model.create({
                user: u._id, 
                name: name,
                message: message,
                link: link,
                seen: 0
            })
        }
        return true
    }

    // async informProject(project_id, sender, name, message, link) {
    //     let project = await this.project_model.findOne({ _id: project_id })
    //     let staff = await this.user_model.find({ _id: {$in : project.team, $ne: sender } })
    //     for (let i = 0; i < staff.length; i++) {
    //         const u = staff[i]            
    //         await this.notification_model.create({
    //             user: u._id, 
    //             name: name,
    //             message: message,
    //             link: link,
    //             seen: 0
    //         })
    //     }
    //     return true
    // }
}