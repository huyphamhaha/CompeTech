from flask import Blueprint, request, jsonify
from services.rules_service import RulesService
import json

rules_bp = Blueprint('rules', __name__)
rules_service = RulesService()

@rules_bp.route('/api/rules/total-points', methods=['GET'])
def get_total_points():
    """Get total behavior points"""
    try:
        total = rules_service.calculate_total_behavior_points()
        return jsonify({
            'success': True,
            'total_points': total,
            'message': f'Tổng điểm biểu hiện: {total}/100'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rules_bp.route('/api/rules/next-code', methods=['POST'])
def get_next_code():
    """Generate next code for a new rule"""
    try:
        data = request.get_json()
        parent_code = data.get('parentCode')
        rule_type = data.get('type')
        
        if not parent_code or not rule_type:
            return jsonify({
                'success': False,
                'error': 'Thiếu thông tin parentCode hoặc type'
            }), 400
        
        next_code = rules_service.get_next_code(parent_code, rule_type)
        return jsonify({
            'success': True,
            'next_code': next_code
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rules_bp.route('/api/rules/add', methods=['POST'])
def add_rule():
    """Add a new rule"""
    try:
        data = request.get_json()
        result = rules_service.add_rule(data)
        
        if result['success']:
            # Save changes to JSON files
            rules_service.save_data()
        
        return jsonify(result)
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rules_bp.route('/api/rules/update', methods=['PUT'])
def update_rule():
    """Update an existing rule"""
    try:
        data = request.get_json()
        rule_code = data.get('code')
        rule_type = data.get('type')
        
        if not rule_code or not rule_type:
            return jsonify({
                'success': False,
                'error': 'Thiếu thông tin code hoặc type'
            }), 400
        
        result = rules_service.update_rule(rule_code, data)
        
        if result['success']:
            # Save changes to JSON files
            rules_service.save_data()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rules_bp.route('/api/rules/delete', methods=['DELETE'])
def delete_rule():
    """Delete a rule"""
    try:
        data = request.get_json()
        rule_code = data.get('code')
        rule_type = data.get('type')
        
        if not rule_code or not rule_type:
            return jsonify({
                'success': False,
                'error': 'Thiếu thông tin code hoặc type'
            }), 400
        
        result = rules_service.delete_rule(rule_code, rule_type)
        
        if result['success']:
            # Save changes to JSON files
            rules_service.save_data()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rules_bp.route('/api/rules/apply', methods=['POST'])
def apply_rule():
    """Apply a rule to a student"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        rule_code = data.get('rule_code')
        rule_type = data.get('rule_type')
        context = data.get('context', {})
        
        if not all([student_id, rule_code, rule_type]):
            return jsonify({
                'success': False,
                'error': 'Thiếu thông tin student_id, rule_code hoặc rule_type'
            }), 400
        
        result = rules_service.apply_rule(student_id, rule_code, rule_type, context)
        return jsonify({
            'success': True,
            'result': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rules_bp.route('/api/rules/progressive-points', methods=['POST'])
def calculate_progressive_points():
    """Calculate progressive points for a rule"""
    try:
        data = request.get_json()
        rule_code = data.get('rule_code')
        violation_count = data.get('violation_count', 1)
        
        if not rule_code:
            return jsonify({
                'success': False,
                'error': 'Thiếu thông tin rule_code'
            }), 400
        
        points = rules_service.calculate_progressive_points(rule_code, violation_count)
        return jsonify({
            'success': True,
            'points': points,
            'violation_count': violation_count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rules_bp.route('/api/rules/conditional-points', methods=['POST'])
def calculate_conditional_points():
    """Calculate conditional points for a rule"""
    try:
        data = request.get_json()
        rule_code = data.get('rule_code')
        condition_type = data.get('condition_type')
        context = data.get('context', {})
        
        if not all([rule_code, condition_type]):
            return jsonify({
                'success': False,
                'error': 'Thiếu thông tin rule_code hoặc condition_type'
            }), 400
        
        points = rules_service.calculate_conditional_points(rule_code, condition_type, context)
        return jsonify({
            'success': True,
            'points': points,
            'condition_type': condition_type
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rules_bp.route('/api/rules/violation-history', methods=['GET'])
def get_violation_history():
    """Get violation history for a student and rule"""
    try:
        student_id = request.args.get('student_id')
        rule_code = request.args.get('rule_code')
        
        if not all([student_id, rule_code]):
            return jsonify({
                'success': False,
                'error': 'Thiếu thông tin student_id hoặc rule_code'
            }), 400
        
        count = rules_service.get_violation_history(student_id, rule_code)
        return jsonify({
            'success': True,
            'violation_count': count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rules_bp.route('/api/rules/data', methods=['GET'])
def get_rules_data():
    """Get all rules data"""
    try:
        rule_type = request.args.get('type', 'all')
        
        if rule_type == 'behaviors':
            data = rules_service.behaviors_data
        elif rule_type == 'plus':
            data = rules_service.plus_data
        elif rule_type == 'minus':
            data = rules_service.minus_data
        else:
            data = {
                'behaviors': rules_service.behaviors_data,
                'plus': rules_service.plus_data,
                'minus': rules_service.minus_data
            }
        
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

