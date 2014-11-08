function model()
{
	var self = this;
	self.current = ko.observable(new computation_model());
	self.computations = ko.observableArray();

	self.commit = function()
	{
		var current = self.current().export();
		self.computations.push(new computation_model(current));
		self.current(new computation_model(current));
	};

	self.remove = function(computation)
	{
		self.computations.remove(computation);
	};

	self.csv = ko.computed
	(
		function()
		{
			var csv = [];
			var columns =
			[
				"Sale Price ($)",
				"Down Payment (%)",
				"Down Payment ($)",
				"Principal ($)",
				"Interest Rate (%)",
				"Loan Length (Months)",
				"Monthly Payment ($)",
				"Total To Pay ($)"
			];

			csv.push(columns.join(","));
			csv = csv.concat
			(
				self.computations().map
				(
					function(c)
					{
						var values =
						[
							c.sale_price(),
							c.down_payment_percent(),
							c.down_payment_amount(),
							c.principal(),
							c.interest_rate(),
							c.number_payments(),
							c.payment(),
							c.total_to_pay()
						];

						return values.join(",");
					}
				)
			);

			return "data:application/csv;charset=utf-8," + encodeURIComponent(csv.join("\n"));
		}
	);
}

function computation_model(data)
{
	data = data || {};
	var self = this;
	self.sale_price = ko.observable(data.sale_price || 300000);
	self.down_payment_percent = ko.observable(data.down_payment_percent || 20);
	self.interest_rate = ko.observable(data.interest_rate || 5.00);
	self.number_payments = ko.observable(data.number_payments || 360);

	self.down_payment_amount = ko.computed
	(
		function() { return self.sale_price() * self.down_payment_percent() / 100; }
	);

	self.principal = ko.computed
	(
		function() { return self.sale_price() - self.down_payment_amount(); }
	);

	self.payment = ko.computed
	(
		function()
		{
			var interest_rate = 1 + self.interest_rate() / 100 / 12;
			var factor = 1 + 1 / (Math.pow(interest_rate, self.number_payments()) - 1);
			var payment = self.principal() * (interest_rate - 1) * factor || 0;
			return payment;
		}
	);

	self.total_to_pay = ko.computed
	(
		function()
		{
			return self.payment() * self.number_payments();
		}
	);

	self.export = function()
	{
		var data = {};
		data.sale_price = self.sale_price();
		data.down_payment_percent = self.down_payment_percent();
		data.interest_rate = self.interest_rate();
		data.number_payments = self.number_payments();
		return data;
	}
}

ko.bindingHandlers.click_select =
{
	"init": function(element)
	{
		element.addEventListener("click", element.select);
	}
};
