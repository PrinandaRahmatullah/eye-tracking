import sys

from flask import request, current_app, Blueprint, jsonify, render_template
from werkzeug.utils import secure_filename
from werkzeug.exceptions import HTTPException, NotFound

sys.path.insert(0, '../services')

current_app.config.update(
    # MAX_CONTENT_LENGTH=5 * 1024 * 1024,
    UPLOAD_EXTENSIONS=['.jpeg', '.jpg', '.png'],
    UPLOAD_PATH='uploads'
)

lms_blueprint = Blueprint('lms', __name__)


@lms_blueprint.route('/')
def lms_index():
    return render_template('custom.html')


@lms_blueprint.route('/pure')
def lms_eye():
    return render_template('calibration.html')
