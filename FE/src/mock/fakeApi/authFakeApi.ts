import { mock } from '../MockAdapter'
import { signInUserData } from '../data/authData'

mock.onPost(`/sign-in`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        email: string
        password: string
    }

    const { email, password } = data

    const user = signInUserData.find(
        (user) => user.email === email && user.password === password,
    )

    if (user) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                // Return full hierarchical user object
                const { password, ...userWithoutPassword } = user
                resolve([
                    201,
                    {
                        user: {
                            userId: user.id,
                            userName: user.userName,
                            email: user.email,
                            avatar: user.avatar,
                            authority: user.authority,
                            role: user.role,
                            managerId: user.managerId,
                            managerName: user.managerName,
                            phone: user.phone,
                            status: user.status,
                        },
                        token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
                    },
                ])
            }, 800)
        })
    }

    return [401, { message: 'Invalid email or password!' }]
})

mock.onPost(`/sign-up`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        email: string
        password: string
        userName: string
    }

    const { email, userName } = data

    const emailUsed = signInUserData.some((user) => user.email === email)
    const newUser = {
        avatar: '',
        userName,
        email,
        authority: ['admin', 'user'],
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            if (emailUsed) {
                resolve([400, { message: 'User already exist!' }])
            }

            resolve([
                201,
                {
                    user: newUser,
                    token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
                },
            ])
        }, 800)
    })
})

mock.onPost(`/reset-password`).reply(() => {
    return [200, true]
})

mock.onPost(`/forgot-password`).reply(() => {
    return [200, true]
})

mock.onPost(`/sign-out`).reply(() => {
    return [200, true]
})
