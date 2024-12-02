import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CreditCard, Bell, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSubscriptions } from "../hooks/useSubscriptions";
import QuickActions from "../components/QuickActions";
import AddSubscriptionModal from "../components/AddSubscriptionModal";

const Dashboard = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { subscriptions, isLoading } = useSubscriptions();

  const calculateMonthlySpend = () => {
    if (!subscriptions) return 0;
    interface Subscription {
      _id: string;
      name: string;
      price: number;
      billingCycle: "monthly" | "yearly" | "quarterly" | "weekly";
      nextBillingDate: string;
      status: string;
      logo?: string;
    }

    const calculateMonthlySpend = (): string => {
      if (!subscriptions) return "0.00";
      return subscriptions
        .reduce((total: number, sub: Subscription) => {
          if (sub.billingCycle === "monthly") return total + sub.price;
          if (sub.billingCycle === "yearly") return total + sub.price / 12;
          if (sub.billingCycle === "quarterly") return total + sub.price / 3;
          if (sub.billingCycle === "weekly") return total + sub.price * 4.33;
          return total;
        }, 0)
        .toFixed(2);
    };
  };

  interface Subscription {
    _id: string;
    name: string;
    price: number;
    billingCycle: "monthly" | "yearly" | "quarterly" | "weekly";
    nextBillingDate: string;
    status: string;
    logo?: string;
    renewalDate?: string;
  }

  const upcomingRenewals: Subscription[] =
    subscriptions?.filter((sub: Subscription) => {
      const renewalDate = new Date(sub.nextBillingDate);
      const today = new Date();
      const diffDays = Math.ceil(
        (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 30;
    }) || [];

  const trialSubscriptions =
    subscriptions?.filter((sub: Subscription) => sub.status === "trial") || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your subscription management dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Subscriptions
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? "..." : subscriptions?.length || 0}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Spend</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${isLoading ? "..." : calculateMonthlySpend()}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Upcoming Renewals
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? "..." : upcomingRenewals.length}
              </p>
            </div>
            <Bell className="h-8 w-8 text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Trial Subscriptions
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? "..." : trialSubscriptions.length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Recent Subscriptions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Subscriptions
        </h2>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">
            {subscriptions?.map((subscription: Subscription) => (
              <motion.div
                key={subscription._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {subscription.logo ? (
                    <img
                      src={subscription.logo}
                      alt={subscription.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {subscription.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {subscription.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Next renewal:{" "}
                      {new Date(
                        subscription.nextBillingDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${subscription.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    {subscription.billingCycle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Renewals
          </h2>
          {upcomingRenewals.map((subscription) => (
            <div
              key={subscription._id}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={subscription.logo}
                  alt={subscription.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-gray-900">
                  {subscription.name}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {subscription.renewalDate}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <QuickActions onAddSubscription={() => setIsModalOpen(true)} />
        </motion.div>
      </div>

      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={() => {
          setIsModalOpen(false);
        }}
      />
    </motion.div>
  );
};

export default Dashboard;
