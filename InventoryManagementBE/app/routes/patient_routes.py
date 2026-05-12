from flask import Blueprint, request, jsonify
from app.models.billing import Bill
from app import db
from datetime import datetime

patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/<phone>/history', methods=['GET'])
def get_patient_history(phone):
    """Get all medical history for a patient based on phone number"""
    try:
        bills = Bill.query.filter_by(customer_phone=phone).order_by(Bill.created_at.desc()).all()
        
        history = []
        for bill in bills:
            # Extract medicines from this bill
            medicines = []
            for item in bill.items:
                medicines.append({
                    'name': item.product_name,
                    'batchNo': item.batch_no,
                    'expiryDate': item.expiry_date,
                    'quantity': item.quantity,
                    'price': item.sell_price
                })
                
            history.append({
                'billId': bill.id,
                'billNumber': bill.bill_number,
                'date': bill.created_at.isoformat(),
                'doctorName': bill.doctor_name,
                'doctorRegNo': bill.doctor_reg_no,
                'prescriptionImage': bill.prescription_image,
                'medicines': medicines,
                'totalAmount': bill.total
            })
            
        return jsonify({
            'success': True,
            'customerName': bills[0].customer_name if bills else 'Unknown',
            'phone': phone,
            'history': history
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@patient_bp.route('/prescriptions/pending', methods=['GET'])
def get_pending_prescriptions():
    """Get all bills that require prescription verification"""
    try:
        # Bills that have a prescription image but are not verified
        bills = Bill.query.filter(Bill.prescription_image != None, Bill.is_prescription_verified == False).all()
        return jsonify({
            'success': True,
            'count': len(bills),
            'bills': [bill.to_dict() for bill in bills]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@patient_bp.route('/prescriptions/<int:bill_id>/verify', methods=['POST'])
def verify_prescription(bill_id):
    """Mark a prescription as verified"""
    try:
        bill = Bill.query.get(bill_id)
        if not bill:
            return jsonify({'success': False, 'message': 'Bill not found'}), 404
            
        bill.is_prescription_verified = True
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Prescription verified successfully'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
