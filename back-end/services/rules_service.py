import json
from typing import Dict, List, Optional, Union
from datetime import datetime

class RulesService:
    def __init__(self):
        # Load JSON data
        with open('competech/admin/ccpad/src/components/bieuhien.json', 'r', encoding='utf-8') as f:
            self.behaviors_data = json.load(f)
        
        with open('competech/admin/ccpad/src/components/diemcong.json', 'r', encoding='utf-8') as f:
            self.plus_data = json.load(f)
        
        with open('competech/admin/ccpad/src/components/diemtru.json', 'r', encoding='utf-8') as f:
            self.minus_data = json.load(f)

    def calculate_total_behavior_points(self) -> int:
        """Calculate total points for behaviors"""
        total = 0
        for category in self.behaviors_data.values():
            for criterion in category['criteria'].values():
                total += criterion['point']
        return total

    def get_next_code(self, parent_code: str, rule_type: str) -> str:
        """Generate next code for a new rule"""
        if rule_type == 'behaviors':
            data = self.behaviors_data
            suffix = 'A'
        elif rule_type == 'plus':
            data = self.plus_data
            suffix = 'C'
        else:  # minus
            data = self.minus_data
            suffix = 'B'

        # Find the parent criterion
        for category in data.values():
            for criterion in category['criteria'].values():
                if criterion['code'] == parent_code:
                    items = criterion.get('behaviors', criterion.get('plus', criterion.get('minus', {})))
                    existing_codes = list(items.keys())
                    
                    if not existing_codes:
                        return f"{parent_code}.{suffix}1"
                    
                    # Find the last code and increment
                    last_code = existing_codes[-1]
                    match = last_code.split('.')[-1]
                    if match.startswith(suffix):
                        try:
                            number = int(match[1:])
                            return f"{parent_code}.{suffix}{number + 1}"
                        except ValueError:
                            pass
                    
                    return f"{parent_code}.{suffix}{len(existing_codes) + 1}"
        
        return f"{parent_code}.{suffix}1"

    def calculate_progressive_points(self, rule_code: str, violation_count: int) -> int:
        """Calculate points for progressive violations"""
        # Find the rule in minus data
        for category in self.minus_data.values():
            for criterion in category['criteria'].values():
                if 'minus' in criterion:
                    for minus_item in criterion['minus'].values():
                        if minus_item['code'] == rule_code and minus_item.get('point') == 'progressive':
                            levels = minus_item.get('levels', [])
                            if levels:
                                # Find the appropriate level based on violation count
                                for level in levels:
                                    if level['level'] == violation_count:
                                        return level['point']
                                # If violation count exceeds max level, use the highest level
                                if levels:
                                    return levels[-1]['point']
        return 0

    def calculate_conditional_points(self, rule_code: str, condition_type: str, context: Dict = None) -> int:
        """Calculate points for conditional violations/rewards"""
        # Find the rule in data
        for data_source in [self.minus_data, self.plus_data]:
            for category in data_source.values():
                for criterion in category['criteria'].values():
                    items = criterion.get('minus', criterion.get('plus', {}))
                    for item in items.values():
                        if item['code'] == rule_code and item.get('point') == 'conditional':
                            conditions = item.get('conditions', [])
                            for condition in conditions:
                                if condition.get('type') == condition_type:
                                    return condition['point']
        return 0

    def add_rule(self, rule_data: Dict) -> Dict:
        """Add a new rule to the appropriate JSON file"""
        rule_type = rule_data.get('type')
        parent_code = rule_data.get('parentCode')
        code = rule_data.get('code')
        description = rule_data.get('description')
        point = rule_data.get('point')
        point_type = rule_data.get('pointType')

        # Validate total points for behaviors
        if rule_type == 'behaviors':
            current_total = self.calculate_total_behavior_points()
            if current_total + point > 100:
                raise ValueError("Tổng điểm biểu hiện không được vượt quá 100 điểm")

        # Prepare the new rule
        new_rule = {
            'code': code,
            'description': description,
            'point': point if point_type == 'fixed' else point_type
        }

        # Add progressive levels if applicable
        if point_type == 'progressive':
            new_rule['levels'] = rule_data.get('levels', [])

        # Add conditions if applicable
        if point_type == 'conditional':
            new_rule['conditions'] = rule_data.get('conditions', [])

        # Add to appropriate data structure
        if rule_type == 'behaviors':
            self._add_to_behaviors(parent_code, new_rule)
        elif rule_type == 'plus':
            self._add_to_plus(parent_code, new_rule)
        else:  # minus
            self._add_to_minus(parent_code, new_rule)

        return {
            'success': True,
            'message': 'Thêm nội quy thành công',
            'rule': new_rule
        }

    def _add_to_behaviors(self, parent_code: str, rule: Dict):
        """Add rule to behaviors data"""
        for category in self.behaviors_data.values():
            for criterion in category['criteria'].values():
                if criterion['code'] == parent_code:
                    if 'behaviors' not in criterion:
                        criterion['behaviors'] = {}
                    criterion['behaviors'][rule['code']] = rule
                    return

    def _add_to_plus(self, parent_code: str, rule: Dict):
        """Add rule to plus data"""
        for category in self.plus_data.values():
            for criterion in category['criteria'].values():
                if criterion['code'] == parent_code:
                    if 'plus' not in criterion:
                        criterion['plus'] = {}
                    criterion['plus'][rule['code']] = rule
                    return

    def _add_to_minus(self, parent_code: str, rule: Dict):
        """Add rule to minus data"""
        for category in self.minus_data.values():
            for criterion in category['criteria'].values():
                if criterion['code'] == parent_code:
                    if 'minus' not in criterion:
                        criterion['minus'] = {}
                    criterion['minus'][rule['code']] = rule
                    return

    def update_rule(self, rule_code: str, rule_data: Dict) -> Dict:
        """Update an existing rule"""
        rule_type = rule_data.get('type')
        
        # Find and update the rule
        if rule_type == 'behaviors':
            success = self._update_in_behaviors(rule_code, rule_data)
        elif rule_type == 'plus':
            success = self._update_in_plus(rule_code, rule_data)
        else:  # minus
            success = self._update_in_minus(rule_code, rule_data)

        if success:
            return {
                'success': True,
                'message': 'Cập nhật nội quy thành công'
            }
        else:
            return {
                'success': False,
                'message': 'Không tìm thấy nội quy cần cập nhật'
            }

    def _update_in_behaviors(self, rule_code: str, rule_data: Dict) -> bool:
        """Update rule in behaviors data"""
        for category in self.behaviors_data.values():
            for criterion in category['criteria'].values():
                if 'behaviors' in criterion and rule_code in criterion['behaviors']:
                    criterion['behaviors'][rule_code].update(rule_data)
                    return True
        return False

    def _update_in_plus(self, rule_code: str, rule_data: Dict) -> bool:
        """Update rule in plus data"""
        for category in self.plus_data.values():
            for criterion in category['criteria'].values():
                if 'plus' in criterion and rule_code in criterion['plus']:
                    criterion['plus'][rule_code].update(rule_data)
                    return True
        return False

    def _update_in_minus(self, rule_code: str, rule_data: Dict) -> bool:
        """Update rule in minus data"""
        for category in self.minus_data.values():
            for criterion in category['criteria'].values():
                if 'minus' in criterion and rule_code in criterion['minus']:
                    criterion['minus'][rule_code].update(rule_data)
                    return True
        return False

    def delete_rule(self, rule_code: str, rule_type: str) -> Dict:
        """Delete a rule"""
        if rule_type == 'behaviors':
            success = self._delete_from_behaviors(rule_code)
        elif rule_type == 'plus':
            success = self._delete_from_plus(rule_code)
        else:  # minus
            success = self._delete_from_minus(rule_code)

        if success:
            return {
                'success': True,
                'message': 'Xóa nội quy thành công'
            }
        else:
            return {
                'success': False,
                'message': 'Không tìm thấy nội quy cần xóa'
            }

    def _delete_from_behaviors(self, rule_code: str) -> bool:
        """Delete rule from behaviors data"""
        for category in self.behaviors_data.values():
            for criterion in category['criteria'].values():
                if 'behaviors' in criterion and rule_code in criterion['behaviors']:
                    del criterion['behaviors'][rule_code]
                    return True
        return False

    def _delete_from_plus(self, rule_code: str) -> bool:
        """Delete rule from plus data"""
        for category in self.plus_data.values():
            for criterion in category['criteria'].values():
                if 'plus' in criterion and rule_code in criterion['plus']:
                    del criterion['plus'][rule_code]
                    return True
        return False

    def _delete_from_minus(self, rule_code: str) -> bool:
        """Delete rule from minus data"""
        for category in self.minus_data.values():
            for criterion in category['criteria'].values():
                if 'minus' in criterion and rule_code in criterion['minus']:
                    del criterion['minus'][rule_code]
                    return True
        return False

    def save_data(self):
        """Save all data back to JSON files"""
        with open('competech/admin/ccpad/src/components/bieuhien.json', 'w', encoding='utf-8') as f:
            json.dump(self.behaviors_data, f, ensure_ascii=False, indent=2)
        
        with open('competech/admin/ccpad/src/components/diemcong.json', 'w', encoding='utf-8') as f:
            json.dump(self.plus_data, f, ensure_ascii=False, indent=2)
        
        with open('competech/admin/ccpad/src/components/diemtru.json', 'w', encoding='utf-8') as f:
            json.dump(self.minus_data, f, ensure_ascii=False, indent=2)

    def get_violation_history(self, student_id: str, rule_code: str) -> int:
        """Get violation count for a specific rule and student"""
        # This would typically query a database
        # For now, return a mock value
        return 0

    def apply_rule(self, student_id: str, rule_code: str, rule_type: str, context: Dict = None) -> Dict:
        """Apply a rule and calculate points"""
        if rule_type == 'behaviors':
            return self._apply_behavior_rule(student_id, rule_code)
        elif rule_type == 'plus':
            return self._apply_plus_rule(student_id, rule_code, context)
        else:  # minus
            return self._apply_minus_rule(student_id, rule_code, context)

    def _apply_behavior_rule(self, student_id: str, rule_code: str) -> Dict:
        """Apply behavior rule"""
        for category in self.behaviors_data.values():
            for criterion in category['criteria'].values():
                if 'behaviors' in criterion and rule_code in criterion['behaviors']:
                    rule = criterion['behaviors'][rule_code]
                    return {
                        'points': rule['point'],
                        'description': rule['description'],
                        'type': 'behavior'
                    }
        return {'points': 0, 'description': 'Không tìm thấy quy tắc', 'type': 'behavior'}

    def _apply_plus_rule(self, student_id: str, rule_code: str, context: Dict = None) -> Dict:
        """Apply plus rule"""
        for category in self.plus_data.values():
            for criterion in category['criteria'].values():
                if 'plus' in criterion and rule_code in criterion['plus']:
                    rule = criterion['plus'][rule_code]
                    if rule.get('point') == 'conditional':
                        # Handle conditional logic
                        points = self.calculate_conditional_points(rule_code, context.get('condition_type', ''), context)
                    else:
                        points = rule['point']
                    
                    return {
                        'points': points,
                        'description': rule['description'],
                        'type': 'plus'
                    }
        return {'points': 0, 'description': 'Không tìm thấy quy tắc', 'type': 'plus'}

    def _apply_minus_rule(self, student_id: str, rule_code: str, context: Dict = None) -> Dict:
        """Apply minus rule"""
        for category in self.minus_data.values():
            for criterion in category['criteria'].values():
                if 'minus' in criterion and rule_code in criterion['minus']:
                    rule = criterion['minus'][rule_code]
                    
                    if rule.get('point') == 'progressive':
                        # Get violation count and calculate progressive points
                        violation_count = self.get_violation_history(student_id, rule_code) + 1
                        points = self.calculate_progressive_points(rule_code, violation_count)
                    elif rule.get('point') == 'conditional':
                        # Handle conditional logic
                        points = self.calculate_conditional_points(rule_code, context.get('condition_type', ''), context)
                    else:
                        points = rule['point']
                    
                    return {
                        'points': points,
                        'description': rule['description'],
                        'type': 'minus',
                        'violation_count': violation_count if rule.get('point') == 'progressive' else None
                    }
        return {'points': 0, 'description': 'Không tìm thấy quy tắc', 'type': 'minus'}

