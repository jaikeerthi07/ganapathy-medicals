from app import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    batch_no = db.Column(db.String(100))
    expiry_date = db.Column(db.String(50))
    manufacturer = db.Column(db.String(100))
    hsn_code = db.Column(db.String(50))
    gst_rate = db.Column(db.Float, default=0.0)
    category = db.Column(db.String(100))
    composition = db.Column(db.Text)
    
    # Keeping old fields for compatibility but they will be mapped in UI
    model = db.Column(db.String(100)) # Will map to Strength/Dose
    type = db.Column(db.String(100)) # Will map to Form (Tablet, etc.)

    buy_price = db.Column(db.Float, nullable=False)
    sell_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    
    # Medical specific fields
    rack_no = db.Column(db.String(50))
    shelf_no = db.Column(db.String(50))
    is_prescription_required = db.Column(db.Boolean, default=False)
    storage_conditions = db.Column(db.String(200))
    reorder_level = db.Column(db.Integer, default=10)

    profit_percent = db.Column(db.Float)
    amount = db.Column(db.Float)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def calculate_values(self):
        if self.buy_price and self.buy_price > 0:
            self.profit_percent = round(
                ((self.sell_price - self.buy_price) / self.buy_price) * 100, 2
            )
        else:
            self.profit_percent = 0

        self.amount = round(self.sell_price * self.quantity, 2)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "batchNo": self.batch_no,
            "expiryDate": self.expiry_date,
            "manufacturer": self.manufacturer,
            "hsnCode": self.hsn_code,
            "gstRate": self.gst_rate,
            "category": self.category,
            "composition": self.composition,
            "model": self.model,
            "type": self.type,
            "buyPrice": self.buy_price,
            "sellPrice": self.sell_price,
            "quantity": self.quantity,
            "rackNo": self.rack_no,
            "shelfNo": self.shelf_no,
            "isPrescriptionRequired": self.is_prescription_required,
            "storageConditions": self.storage_conditions,
            "reorderLevel": self.reorder_level,
            "profitPercent": self.profit_percent,
            "amount": self.amount,
            "created_at": self.created_at
        }