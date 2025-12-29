import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ApiService from '@/services/ApiService'

const ApiTest = () => {
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testApi = async (name: string, apiCall: () => Promise<any>) => {
        setLoading(true)
        try {
            const result = await apiCall()
            setResponse({ name, success: true, data: result })
            console.log(`✅ ${name}:`, result)
        } catch (error: any) {
            setResponse({ name, success: false, error: error.message })
            console.error(`❌ ${name}:`, error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Mock API Test Page</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* User API Tests */}
                <Card>
                    <h3 className="font-bold mb-3">User APIs</h3>
                    <div className="space-y-2">
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get All Users', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/users',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Get All Users
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get User by ID', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/users/user-1',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Get User (user-1)
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get User Team', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/users/team/user-2',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Get Team (EM1)
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Hierarchy Tree', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/users/hierarchy/user-1',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Get Hierarchy Tree
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Pending Approvals', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/users/pending-approvals',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Pending Approvals
                        </Button>
                    </div>
                </Card>

                {/* Contract API Tests */}
                <Card>
                    <h3 className="font-bold mb-3">Contract APIs</h3>
                    <div className="space-y-2">
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get All Contracts', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/contracts',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Get All Contracts
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Contract by ID', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/contracts/contract-1',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Get Contract (contract-1)
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get My Contracts', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/contracts/my-contracts',
                                        method: 'get',
                                        params: { userId: 'user-8' },
                                    })
                                )
                            }
                        >
                            My Contracts (user-8)
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Pending Contracts', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/contracts/pending',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Pending Contracts
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Commissions', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/contracts/commissions/user-8',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Get Commissions (user-8)
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Contract Stats', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/contracts/statistics',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Contract Statistics
                        </Button>
                    </div>
                </Card>

                {/* Property API Tests */}
                <Card>
                    <h3 className="font-bold mb-3">Property APIs</h3>
                    <div className="space-y-2">
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get All Properties', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/properties',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Get All Properties
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Property by ID', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/properties/property-1',
                                        method: 'get',
                                    })
                                )
                            }
                        >
                            Get Property (property-1)
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get My Properties', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/properties/my-properties',
                                        method: 'get',
                                        params: { userId: 'user-8' },
                                    })
                                )
                            }
                        >
                            My Properties (user-8)
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Available Properties', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/properties',
                                        method: 'get',
                                        params: { status: 'available' },
                                    })
                                )
                            }
                        >
                            Available Properties
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Property Stats', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/properties/statistics',
                                        method: 'get',
                                        params: { userId: 'user-8' },
                                    })
                                )
                            }
                        >
                            Property Statistics
                        </Button>
                    </div>
                </Card>

                {/* Notification API Tests */}
                <Card>
                    <h3 className="font-bold mb-3">Notification APIs</h3>
                    <div className="space-y-2">
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Notifications', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/notifications',
                                        method: 'get',
                                        params: { userId: 'user-1' },
                                    })
                                )
                            }
                        >
                            Get Notifications (Super Admin)
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Agent Notifications', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/notifications',
                                        method: 'get',
                                        params: { userId: 'user-8' },
                                    })
                                )
                            }
                        >
                            Get Notifications (Agent)
                        </Button>
                        <Button
                            size="sm"
                            block
                            onClick={() =>
                                testApi('Get Notification Stats', () =>
                                    ApiService.fetchDataWithAxios({
                                        url: '/api/notifications/statistics',
                                        method: 'get',
                                        params: { userId: 'user-1' },
                                    })
                                )
                            }
                        >
                            Notification Statistics
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Response Display */}
            {response && (
                <Card className="mt-6">
                    <h3 className="font-bold mb-3">
                        {response.success ? '✅' : '❌'} {response.name}
                    </h3>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(
                            response.success ? response.data : response.error,
                            null,
                            2
                        )}
                    </pre>
                </Card>
            )}

            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                        <div className="text-center">Loading...</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ApiTest
