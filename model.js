function model()
{
	var self = this;
	self.current = new computation_model();
	self.computations = ko.observableArray();

	self.commit = function()
	{
		var current = self.current.export();
		self.computations.push(new computation_model(current));
		self.current = new computation_model(current);
	}
}

function computation_model(data)
{
	data = data || {};
	var self = this;
	self.sale_price = ko.observable(data.sale_price || 0);
	self.down_payment_percent = ko.observable(data.down_payment_percent || 0);
	self.interest_rate = ko.observable(data.interest_rate || 0);
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
			return self.principal() * (interest_rate - 1) * factor || 0;
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
